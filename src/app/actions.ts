"use server";

import { execFile } from "node:child_process";
import { randomBytes, randomInt } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { updateTag } from "next/cache";
import type { Fighter } from "@/data/fighters";
import {
  LIMITS,
  PHOTO_MAX_BYTES,
  type JoinState,
  type JoinValues,
} from "@/data/join";
import {
  addChallenger,
  FIGHTERS_TAG,
  isRosterFull,
  UPLOAD_DIR,
} from "@/lib/fighter-store";

const run = promisify(execFile);

const SPRITE_SCRIPT = path.join(process.cwd(), "scripts", "make-sprites.mjs");
const SPRITE_TIMEOUT_MS = 120_000;
const ACCENTS = [
  "#3ddcff",
  "#ff4d5e",
  "#ffd23f",
  "#6be675",
  "#c58cff",
  "#ff9d3d",
];

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// The sprite pipeline runs in its own process: the background-removal model is
// memory hungry, and its bundled sharp can't share a process with Next's.
async function makeSprite(photo: File, output: string) {
  const workDir = await mkdtemp(path.join(tmpdir(), "osfight-"));
  try {
    const input = path.join(workDir, "photo");
    await writeFile(input, Buffer.from(await photo.arrayBuffer()));
    await run(process.execPath, [SPRITE_SCRIPT, input, output], {
      timeout: SPRITE_TIMEOUT_MS,
    });
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

export async function addFighter(
  _previous: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const values: JoinValues = {
    name: text(formData, "name"),
    title: text(formData, "title"),
    move: text(formData, "move"),
    bio: text(formData, "bio"),
  };
  const fail = (message: string): JoinState => ({
    status: "error",
    message,
    values,
  });

  if (!values.name || !values.move) return fail("選手名稱和必殺技是必填的。");
  if (
    values.name.length > LIMITS.name ||
    values.title.length > LIMITS.title ||
    values.move.length > LIMITS.move ||
    values.bio.length > LIMITS.bio
  ) {
    return fail("有欄位超過字數上限了。");
  }

  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return fail("請選一張物品的照片。");
  }
  if (!photo.type.startsWith("image/") || photo.size > PHOTO_MAX_BYTES) {
    return fail("照片格式不對或檔案太大，請換一張 JPG 或 PNG。");
  }
  if (await isRosterFull()) return fail("選手名單已經額滿了。");

  const id = randomBytes(8).toString("hex");
  const sprite = path.join(UPLOAD_DIR, `${id}.png`);
  try {
    await makeSprite(photo, sprite);
  } catch (error) {
    console.error("Sprite generation failed", error);
    return fail("照片處理失敗，請換一張主角清楚、背景單純的照片。");
  }

  const fighter: Fighter = {
    id,
    image: `/uploads/${id}.png`,
    name: values.name,
    title: values.title || "神秘挑戰者",
    // Stats are rolled by the arena, not chosen by the challenger.
    stats: {
      attack: randomInt(2, 11),
      defense: randomInt(2, 11),
      speed: randomInt(2, 11),
    },
    move: values.move,
    bio: values.bio || "來歷不明的新面孔，實力有待擂臺驗證。",
    accent: ACCENTS[randomInt(ACCENTS.length)],
  };

  if (!(await addChallenger(fighter))) {
    await rm(sprite, { force: true });
    return fail("選手名單已經額滿了。");
  }

  updateTag(FIGHTERS_TAG);
  return { status: "success", message: `${fighter.name} 已加入選手名單！` };
}

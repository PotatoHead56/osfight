import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { cacheTag } from "next/cache";
import { fighters, type Fighter } from "@/data/fighters";

// Visitor-submitted fighters live outside the source tree, in /data (git-ignored).
const DATA_DIR = path.join(process.cwd(), "data");
const CHALLENGERS_FILE = path.join(DATA_DIR, "fighters.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

export const FIGHTERS_TAG = "fighters";
export const MAX_CHALLENGERS = 100;

async function readChallengers(): Promise<Fighter[]> {
  try {
    return JSON.parse(await readFile(CHALLENGERS_FILE, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function getAllFighters(): Promise<Fighter[]> {
  "use cache";
  cacheTag(FIGHTERS_TAG);
  return [...fighters, ...(await readChallengers())];
}

export async function isRosterFull(): Promise<boolean> {
  return (await readChallengers()).length >= MAX_CHALLENGERS;
}

// Writes are chained so two simultaneous sign-ups can't overwrite each other.
let pendingWrite: Promise<unknown> = Promise.resolve();

// Resolves to false when the roster is already full.
export function addChallenger(fighter: Fighter): Promise<boolean> {
  const write = pendingWrite.then(async () => {
    const challengers = await readChallengers();
    if (challengers.length >= MAX_CHALLENGERS) return false;

    await mkdir(DATA_DIR, { recursive: true });
    const draft = `${CHALLENGERS_FILE}.tmp`;
    await writeFile(draft, JSON.stringify([...challengers, fighter], null, 2));
    await rename(draft, CHALLENGERS_FILE);
    return true;
  });
  pendingWrite = write.catch(() => {});
  return write;
}

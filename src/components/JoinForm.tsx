"use client";

import { useActionState, useEffect, useState } from "react";
import { addFighter } from "@/app/actions";
import { LIMITS, PHOTO_MAX_EDGE, type JoinState } from "@/data/join";

const FIELD =
  "w-full border-4 border-ink bg-ink px-3 py-2 text-[16px] text-paper placeholder:text-dim/60 focus:border-gold focus:outline-none";
const LABEL = "mb-1 block text-[12px] text-dim";

// Phone photos are several megabytes; the sprite only needs a small copy.
async function shrinkPhoto(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const scale = Math.min(
    1,
    PHOTO_MAX_EDGE / Math.max(bitmap.width, bitmap.height),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );
  if (!blob) throw new Error("Could not encode the photo");
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}

async function submit(
  previous: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      formData.set("photo", await shrinkPhoto(photo));
    } catch {
      return {
        status: "error",
        message: "讀不了這張照片，請改用 JPG 或 PNG。",
      };
    }
  }
  return addFighter(previous, formData);
}

export function JoinForm() {
  const [state, formAction, pending] = useActionState(submit, {
    status: "idle",
    message: "",
  });
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const values = state.values;

  return (
    <form
      action={formAction}
      // The form resets after each attempt, so the old preview no longer applies.
      onSubmit={() => setPreview(null)}
      className="pixel-box grid gap-6 bg-panel p-4 sm:p-6 md:grid-cols-[240px_1fr]"
    >
      <div>
        <label htmlFor="join-photo" className={LABEL}>
          物品照片（必填）
        </label>
        <div className="mb-3 flex aspect-square max-w-60 items-center justify-center border-4 border-ink bg-ink">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img
              src={preview}
              alt="已選擇的照片預覽"
              className="h-full w-full object-contain"
            />
          ) : (
            <span aria-hidden className="text-[72px] leading-none text-dim">
              ?
            </span>
          )}
        </div>
        <input
          id="join-photo"
          name="photo"
          type="file"
          accept="image/*"
          required
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
          className="w-full text-[12px] text-dim file:mr-3 file:border-0 file:bg-paper file:px-3 file:py-2 file:text-ink"
        />
        <p className="mt-2 text-[12px] leading-relaxed text-dim">
          主角清楚、背景單純的照片效果最好。上傳後會自動去背並變成像素圖。
        </p>
      </div>

      <div className="grid content-start gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="join-name" className={LABEL}>
            選手名稱（必填）
          </label>
          <input
            id="join-name"
            name="name"
            required
            maxLength={LIMITS.name}
            defaultValue={values?.name}
            placeholder="例：吹風機"
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor="join-title" className={LABEL}>
            稱號
          </label>
          <input
            id="join-title"
            name="title"
            maxLength={LIMITS.title}
            defaultValue={values?.title}
            placeholder="例：熱風暴君"
            className={FIELD}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="join-move" className={LABEL}>
            必殺技（必填）
          </label>
          <input
            id="join-move"
            name="move"
            required
            maxLength={LIMITS.move}
            defaultValue={values?.move}
            placeholder="例：三千度烈焰吹襲"
            className={FIELD}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="join-bio" className={LABEL}>
            選手介紹
          </label>
          <textarea
            id="join-bio"
            name="bio"
            rows={3}
            maxLength={LIMITS.bio}
            defaultValue={values?.bio}
            placeholder="他有什麼不為人知的故事？"
            className={`${FIELD} resize-none`}
          />
        </div>

        <div className="flex flex-col gap-3 sm:col-span-2">
          <p className="text-[12px] text-dim">
            攻擊、防禦、速度由擂臺隨機抽出，報名後才會揭曉。
          </p>
          <button
            type="submit"
            disabled={pending}
            className="pixel-box self-start bg-gold px-6 py-3 text-[24px] text-ink hover:bg-paper active:translate-x-1 active:translate-y-1 active:shadow-none disabled:bg-dim"
          >
            {pending ? "變身中…" : "▶ 報名參賽"}
          </button>
          <p aria-live="polite" className="min-h-6 text-[16px]">
            {pending ? (
              <span className="text-dim">
                正在去背、轉成像素圖，大約需要十秒。
              </span>
            ) : state.status === "success" ? (
              <span className="text-gold">
                {state.message}{" "}
                <a href="#roster" className="underline">
                  回選手名單看看
                </a>
              </span>
            ) : state.status === "error" ? (
              <span className="text-blood">{state.message}</span>
            ) : null}
          </p>
        </div>
      </div>
    </form>
  );
}

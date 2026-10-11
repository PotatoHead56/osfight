"use client";

import { useState } from "react";

// Placeholder for the sign-up feature. The working form is JoinForm.tsx; swap it
// back in on the home page once storage and moderation are ready.
export function JoinTeaser() {
  const [asked, setAsked] = useState(false);

  return (
    <div className="pixel-box flex flex-col items-center gap-6 bg-panel px-4 py-10 text-center sm:py-14">
      <p className="bg-blood px-3 py-1 text-[12px] text-ink">COMING SOON</p>
      <div
        aria-hidden
        className="flex aspect-square w-[136px] items-center justify-center border-4 border-ink bg-ink text-[72px] leading-none text-dim"
      >
        ?
      </div>
      <p className="max-w-xl text-[16px] leading-relaxed text-dim">
        上傳一張物品的照片，它就會變成擂台選手，加入這場大混戰。
      </p>
      <button
        type="button"
        onClick={() => setAsked(true)}
        className="pixel-box bg-gold px-6 py-3 text-[24px] text-ink hover:bg-paper active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        ▶ 上傳我的選手
      </button>
      <p aria-live="polite" className="min-h-6 text-[16px] text-gold">
        {asked ? "報名功能尚未上線，敬請期待！" : null}
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { PRESENCE_HEARTBEAT_MS } from "@/data/presence";

const NAME_MAX = 12;

// One id per page load, so a remount doesn't count the same tab twice.
let visitorId: string | undefined;

// Not crypto.randomUUID: it is missing when the site is opened over plain
// http from another device on the network.
function createVisitorId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

// Asks for the visitor's name on every visit, then greets them under the
// header. The name lives in memory only, so a reload asks again.
export function CoachWelcome() {
  const [name, setName] = useState<string | null>(null);
  const [online, setOnline] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  // Every open tab counts as online, whether or not a name was entered yet.
  useEffect(() => {
    const id = (visitorId ??= createVisitorId());

    let cancelled = false;
    const beat = async () => {
      try {
        const response = await fetch("/api/presence", {
          method: "POST",
          body: id,
        });
        if (!response.ok) return;
        const data: { online: number } = await response.json();
        if (!cancelled) setOnline(data.online);
      } catch {
        // Offline or the server is restarting; the next beat will catch up.
      }
    };
    // Background tabs throttle timers, so report in as soon as one is shown again.
    const onVisible = () => {
      if (document.visibilityState === "visible") beat();
    };

    beat();
    const timer = setInterval(beat, PRESENCE_HEARTBEAT_MS);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (name !== null) {
    return (
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-gold px-4 py-1 text-[12px] text-ink sm:px-8 sm:text-[16px]">
        <p className="col-start-2">
          <span aria-hidden>★ </span>
          歡迎{name}教練
          <span aria-hidden> ★</span>
        </p>
        {online !== null && (
          <p className="justify-self-end whitespace-nowrap">
            <span aria-hidden className="animate-blink text-blood">
              ●{" "}
            </span>
            在線 {online} 人
          </p>
        )}
      </div>
    );
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="coach-heading"
      // The name is required to enter, so Esc must not dismiss the dialog.
      onCancel={(event) => event.preventDefault()}
      className="pixel-box m-auto w-[calc(100%-2rem)] max-w-md bg-panel p-6 text-paper backdrop:bg-ink/85"
    >
      <form
        action={(formData) => {
          const value = String(formData.get("coach") ?? "").trim();
          if (value) setName(value);
        }}
        className="flex flex-col gap-4"
      >
        <p className="self-start bg-blood px-3 py-1 text-[12px] text-ink">
          PLAYER 1
        </p>
        <h2 id="coach-heading" className="text-[24px] leading-tight text-gold">
          教練，請問怎麼稱呼？
        </h2>
        <div>
          <label htmlFor="coach-name" className="mb-1 block text-[12px] text-dim">
            你的稱呼
          </label>
          <input
            id="coach-name"
            name="coach"
            required
            maxLength={NAME_MAX}
            autoComplete="off"
            placeholder="例：小明"
            className="w-full border-4 border-ink bg-ink px-3 py-2 text-[16px] text-paper placeholder:text-dim/60 focus:border-gold focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="pixel-box self-start bg-gold px-6 py-3 text-[24px] text-ink hover:bg-paper active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          ▶ 進入擂臺
        </button>
      </form>
    </dialog>
  );
}

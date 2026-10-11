import Image from "next/image";
import { fighters } from "@/data/fighters";

// Where each fighter floats in the hero. A positive --speed lags behind the
// scroll (far away); a negative one rushes past (close to the viewer).
const FLOATING: Record<string, string> = {
  fan: "left-[3%] top-[6%] w-16 sm:w-32 lg:w-48 [--speed:-0.3]",
  mug: "right-[4%] top-[9%] w-16 sm:w-32 [--speed:0.25]",
  remote: "left-[6%] bottom-[16%] w-16 sm:w-32 [--speed:0.4]",
  slipper: "right-[3%] bottom-[14%] w-16 sm:w-32 lg:w-48 [--speed:-0.45]",
  lamp: "right-[17%] top-[44%] hidden w-24 opacity-70 lg:block [--speed:0.55]",
  pillow: "left-[16%] top-[42%] hidden w-24 opacity-70 lg:block [--speed:0.5]",
};

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden px-4 py-24 sm:px-8">
      <div
        aria-hidden
        className="starfield parallax-y absolute inset-0 -z-10 opacity-50 [--speed:0.75]"
      />
      <div
        aria-hidden
        className="starfield parallax-y absolute inset-0 -z-10 [--speed:0.55] [background-position:120px_80px] [background-size:480px_480px]"
      />
      <p
        aria-hidden
        className="parallax-y absolute inset-x-0 top-[18%] -z-10 text-center text-[34vw] leading-none text-transparent [--speed:0.6] [-webkit-text-stroke:2px_var(--color-panel)]"
      >
        FIGHT
      </p>

      {fighters.map(({ id, image }) =>
        image && FLOATING[id] ? (
          <Image
            key={id}
            src={image}
            alt=""
            width={64}
            height={64}
            unoptimized
            className={`parallax-y absolute -z-10 h-auto [image-rendering:pixelated] ${FLOATING[id]}`}
          />
        ) : null,
      )}

      <div className="parallax-y flex flex-col items-center gap-6 text-center [--speed:0.3] sm:gap-8">
        <p className="bg-blood px-3 py-1 text-[12px] text-ink">ROUND 1</p>
        <h1 className="text-[48px] leading-none text-gold [text-shadow:4px_4px_0_var(--color-blood)] sm:text-[72px] sm:[text-shadow:6px_6px_0_var(--color-blood)] lg:text-[96px] lg:[text-shadow:8px_8px_0_var(--color-blood)]">
          OSFIGHT
        </h1>
        <p className="text-[16px] sm:text-[24px]">我家擂臺・萬物皆可戰</p>
        <p className="max-w-xl text-[16px] leading-relaxed text-dim">
          家裡的每一樣東西，其實都是深藏不露的擂臺選手。這裡記錄了他們的數值、必殺技，還有不為人知的故事。
        </p>
        <a
          href="#roster"
          className="pixel-box bg-gold px-6 py-3 text-[24px] text-ink hover:bg-paper active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <span aria-hidden className="animate-blink">
            ▶{" "}
          </span>
          查看選手
        </a>
      </div>

      {/* Ring wall in the foreground: rises faster than the page and swallows the hero. */}
      <div
        aria-hidden
        className="ring-wall parallax-y absolute inset-x-0 top-full h-[40svh] [--speed:-0.2]"
      />
    </section>
  );
}

import Image from "next/image";
import type { CSSProperties } from "react";
import { STAT_MAX, type Fighter, type FighterStats } from "@/data/fighters";

// Intrinsic size of the processed sprites; they are scaled up with crisp pixels.
const SPRITE_SIZE = 64;

const STAT_LABELS: { key: keyof FighterStats; label: string }[] = [
  { key: "attack", label: "攻擊" },
  { key: "defense", label: "防禦" },
  { key: "speed", label: "速度" },
];

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 text-[12px]">
      <dt className="w-8 shrink-0 text-dim">{label}</dt>
      <dd className="flex flex-1 items-center gap-3">
        <span aria-hidden className="flex flex-1 gap-[2px]">
          {Array.from({ length: STAT_MAX }, (_, i) => (
            <span
              key={i}
              className={`h-3 flex-1 ${i < value ? "bg-(--accent)" : "bg-ink"}`}
            />
          ))}
        </span>
        <span className="w-4 text-right">{value}</span>
      </dd>
    </div>
  );
}

export function FighterCard({
  fighter,
  index,
}: {
  fighter: Fighter;
  index: number;
}) {
  const { name, title, stats, move, bio, accent, image } = fighter;

  return (
    <article
      style={{ "--accent": accent } as CSSProperties}
      className="pixel-box flex w-full flex-col bg-panel"
    >
      <header className="bg-(--accent) px-3 py-1 text-[12px] text-ink">
        NO.{String(index + 1).padStart(2, "0")}
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-4 sm:flex-col sm:items-stretch">
          <div className="aspect-square w-[136px] shrink-0 border-4 border-ink bg-ink sm:w-auto">
            {image ? (
              <Image
                src={image}
                alt={name}
                width={SPRITE_SIZE}
                height={SPRITE_SIZE}
                unoptimized
                className="h-full w-full object-contain [image-rendering:pixelated]"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-dim">
                <span
                  aria-hidden
                  className="text-[48px] leading-none sm:text-[72px]"
                >
                  ?
                </span>
                <span className="text-[12px]">照片準備中</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-[12px] text-(--accent)">{title}</p>
            <h3 className="text-[24px] leading-tight">{name}</h3>
          </div>
        </div>

        <dl className="flex flex-col gap-2">
          {STAT_LABELS.map(({ key, label }) => (
            <StatBar key={key} label={label} value={stats[key]} />
          ))}
        </dl>

        <p className="border-l-4 border-(--accent) pl-3 text-[12px]">
          <span className="block text-dim">必殺技</span>
          <span className="text-[16px]">{move}</span>
        </p>

        <p className="text-[16px] leading-relaxed text-dim">{bio}</p>
      </div>
    </article>
  );
}

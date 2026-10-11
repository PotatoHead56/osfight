const REPEAT = 12;

function Row({ text, className }: { text: string; className: string }) {
  return (
    <p className={`parallax-x w-max whitespace-nowrap py-2 text-[24px] ${className}`}>
      {Array.from({ length: REPEAT }, () => text).join("")}
    </p>
  );
}

// Two bands of text that slide in opposite directions as the page scrolls.
export function Marquee() {
  return (
    <div
      aria-hidden
      className="overflow-hidden border-y-4 border-paper bg-ink"
    >
      <Row
        text="SELECT YOUR FIGHTER ★ "
        className="bg-gold text-ink [--speed:-0.6]"
      />
      <Row
        text="萬物皆可戰 ◆ READY? FIGHT! ◆ "
        className="-ml-[150vw] text-gold [--speed:0.6]"
      />
    </div>
  );
}

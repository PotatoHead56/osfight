import Link from "next/link";
import { NAV_LINKS } from "@/data/navigation";

export function SiteFooter() {
  return (
    <footer className="border-t-4 border-paper bg-panel-deep">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div className="flex flex-col gap-3">
          <p className="text-[24px] leading-none text-gold">ALL FIGHT</p>
          <p className="text-[16px] text-dim">我家擂臺・萬物皆可戰</p>
        </div>

        <nav aria-label="頁尾選單">
          <ul className="flex flex-col gap-1 text-[16px]">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-block py-1 hover:text-gold"
                >
                  <span aria-hidden>▶ </span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="border-t-4 border-ink px-4 py-4 text-center text-[12px] text-dim">
        GAME OVER・THANK YOU FOR PLAYING
      </p>
    </footer>
  );
}

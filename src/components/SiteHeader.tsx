import Link from "next/link";
import { CoachWelcome } from "@/components/CoachWelcome";
import { NAV_LINKS } from "@/data/navigation";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b-4 border-paper bg-arena">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link
          href="/"
          className="text-[24px] leading-none text-gold [text-shadow:2px_2px_0_var(--color-blood)]"
        >
          ALL FIGHT
        </Link>
        <nav aria-label="主選單">
          <ul className="flex gap-1 text-[12px] sm:gap-4 sm:text-[16px]">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block px-2 py-2 hover:bg-paper hover:text-ink"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <CoachWelcome />
    </header>
  );
}

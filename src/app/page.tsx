import { FighterCard } from "@/components/FighterCard";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { fighters } from "@/data/fighters";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <Marquee />

      <section
        id="roster"
        className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-16 sm:px-8 sm:py-24"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-4 border-paper pb-3 sm:mb-10">
          <h2 className="text-[24px] leading-none sm:text-[36px]">選手名單</h2>
          <p className="text-[12px] text-dim">SELECT YOUR FIGHTER</p>
        </div>
        <ul className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3">
          {fighters.map((fighter, index) => (
            <li key={fighter.id} className="flex">
              <FighterCard fighter={fighter} index={index} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

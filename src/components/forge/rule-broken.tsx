import Image from "next/image";
import bossDefeated from "@/assets/clay/boss-free-ten-defeated.webp";

export function RuleBroken({
  bossAnswer,
  truthAnswer,
  showCharacter,
}: {
  bossAnswer: number;
  truthAnswer: number;
  showCharacter: boolean;
}) {
  return (
    <section
      aria-live="assertive"
      className="rule-break-shake flex items-center gap-4 rounded-xl bg-coral-100 p-5 shadow-clay-2"
    >
      {showCharacter ? (
        <Image src={bossDefeated} alt="The boss cracking apart" width={62} height={120} />
      ) : null}
      <div className="flex-1">
        <p className="text-caption font-bold tracking-widest text-coral-700 uppercase">
          Rule broken
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 font-mono tabular-nums">
          <span className="rounded-md bg-surface px-3 py-2 text-center">
            <span className="block text-caption text-ink-muted">Boss</span>
            <span className="text-h2 text-coral-700 line-through">{bossAnswer}</span>
          </span>
          <span className="rounded-md bg-surface px-3 py-2 text-center">
            <span className="block text-caption text-ink-muted">Math</span>
            <span className="text-h2 text-mint-700">{truthAnswer}</span>
          </span>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ClockIcon, SkullIcon, StackIcon } from "@phosphor-icons/react/dist/ssr";
import blobMint from "@/assets/clay/blob-mint.webp";
import blobPeach from "@/assets/clay/blob-peach.webp";
import bossIdle from "@/assets/clay/boss-free-ten-idle.webp";
import { AppShell } from "@/components/app/app-shell";
import { PrimaryCta } from "@/components/app/primary-cta";
import { StageRow } from "@/components/app/stage-row";
import { ClayIcon, type ClayGlyph } from "@/components/clay/clay-icon";
import { ClayTag } from "@/components/clay";
import { journeyStages } from "@/lib/journey";

const meta: { glyph: ClayGlyph; label: string }[] = [
  { glyph: StackIcon, label: "7 stages" },
  { glyph: ClockIcon, label: "~6 min" },
  { glyph: SkullIcon, label: "1 boss" },
];

export default function LabPage() {
  return (
    <AppShell>
      <div className="relative h-72 overflow-hidden bg-linear-to-b from-sky-100 to-mint-100">
        <Image src={blobMint} alt="" width={120} height={120} className="absolute -top-6 -left-8" />
        <Image
          src={blobPeach}
          alt=""
          width={104}
          height={104}
          className="absolute top-10 -right-6"
        />
        <Image
          src={bossIdle}
          alt="The Free Ten boss, holding its rod so it cannot come apart"
          width={73}
          height={220}
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          priority
        />
        <Link
          href="/"
          aria-label="Back to home"
          className="clay-interactive absolute top-5 left-5 flex size-11 items-center justify-center rounded-md bg-surface text-ink shadow-clay-1 active:translate-y-px"
        >
          <ClayIcon glyph={ArrowLeftIcon} size="md" weight="bold" />
        </Link>
      </div>

      <div className="relative -mt-6 rounded-t-2xl bg-canvas px-5 pt-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-small font-bold text-mint-700">Subtraction</p>
            <h1 className="mt-1 text-h1 text-ink">Free Ten</h1>
          </div>
          <ClayTag tone="peach">Stage 1</ClayTag>
        </div>

        <p className="mb-5 text-small text-ink-soft">
          Something takes ten ones across but never pays for them. Find out what, then prove it
          wrong.
        </p>

        <ul className="mb-8 flex gap-2">
          {meta.map((item) => (
            <li
              key={item.label}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-surface py-2 shadow-clay-1"
            >
              <ClayIcon glyph={item.glyph} size="sm" className="text-violet-500" />
              <span className="text-caption font-bold text-ink-soft">{item.label}</span>
            </li>
          ))}
        </ul>

        <h2 className="mb-3 text-body font-bold text-ink">Stages</h2>
        <ul className="mb-8 space-y-2">
          {journeyStages.map((stage) => (
            <li key={stage.id}>
              <StageRow stage={stage} />
            </li>
          ))}
        </ul>

        <PrimaryCta href="/play">Start Encounter</PrimaryCta>
      </div>
    </AppShell>
  );
}

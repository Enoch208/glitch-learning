import {
  ArrowRightIcon,
  BookOpenIcon,
  CalculatorIcon,
  CheckCircleIcon,
  FlaskIcon,
  MusicNotesIcon,
  PaletteIcon,
  PuzzlePieceIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { ClayButton, ClayCard, ClayIcon, ClayProgress, ClayTag, ClayTile } from "@/components/clay";
import bossDefeated from "@/assets/clay/boss-free-ten-defeated.webp";
import bossIdle from "@/assets/clay/boss-free-ten-idle.webp";

const violetRamp = [
  { token: "violet-50", swatch: "bg-violet-50" },
  { token: "violet-100", swatch: "bg-violet-100" },
  { token: "violet-200", swatch: "bg-violet-200" },
  { token: "violet-300", swatch: "bg-violet-300" },
  { token: "violet-400", swatch: "bg-violet-400" },
  { token: "violet-500", swatch: "bg-violet-500" },
];

const accentRamp = [
  { token: "mint-100", swatch: "bg-mint-100" },
  { token: "mint-200", swatch: "bg-mint-200" },
  { token: "peach-100", swatch: "bg-peach-100" },
  { token: "coral-100", swatch: "bg-coral-100" },
  { token: "lilac-100", swatch: "bg-lilac-100" },
  { token: "surface-sunken", swatch: "bg-surface-sunken" },
];

const typeScale = [
  { token: "display", sample: "Aa", detail: "48 / 800 / 1.1", className: "text-display" },
  { token: "h1", sample: "Aa", detail: "32 / 700 / 1.2", className: "text-h1" },
  { token: "h2", sample: "Aa", detail: "24 / 700 / 1.3", className: "text-h2" },
  { token: "body", sample: "Aa", detail: "16 / 400 / 1.6", className: "text-body" },
  { token: "small", sample: "Aa", detail: "14 / 500 / 1.5", className: "text-small font-medium" },
  {
    token: "caption",
    sample: "Aa",
    detail: "12 / 500 / 1.3",
    className: "text-caption font-medium",
  },
];

const subjects = [
  { label: "Math", glyph: CalculatorIcon, tone: "violet" },
  { label: "Science", glyph: FlaskIcon, tone: "mint" },
  { label: "Reading", glyph: BookOpenIcon, tone: "peach" },
  { label: "Art", glyph: PaletteIcon, tone: "rose" },
  { label: "Music", glyph: MusicNotesIcon, tone: "sky" },
  { label: "Puzzle", glyph: PuzzlePieceIcon, tone: "lilac" },
] as const;

const elevations = [
  { token: "clay-1", className: "shadow-clay-1" },
  { token: "clay-2", className: "shadow-clay-2" },
  { token: "clay-3", className: "shadow-clay-3" },
] as const;

export default function SkinPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <header className="mb-12 max-w-xl">
        <p className="mb-3 font-mono text-caption tracking-widest text-violet-500 uppercase">
          Design system
        </p>
        <h1 className="text-display text-ink">GLITCH Clay</h1>
        <p className="mt-4 text-body text-ink-muted">
          Soft shapes, tinted shadows and one tactile motion language. Every value below is a token.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ClayCard>
          <h2 className="mb-5 text-small font-bold text-ink-soft">Colour</h2>
          <div className="grid grid-cols-3 gap-3">
            {[...violetRamp, ...accentRamp].map((entry) => (
              <div key={entry.token}>
                <div
                  className={`h-14 w-full rounded-sm shadow-clay-1 ${entry.swatch}`}
                  aria-hidden="true"
                />
                <p className="mt-2 font-mono text-caption text-ink-muted">{entry.token}</p>
              </div>
            ))}
          </div>
        </ClayCard>

        <ClayCard>
          <h2 className="mb-5 text-small font-bold text-ink-soft">Typography</h2>
          <p className="mb-4 font-mono text-caption text-ink-muted">Plus Jakarta Sans</p>
          <ul className="space-y-3">
            {typeScale.map((entry) => (
              <li key={entry.token} className="flex items-baseline justify-between gap-4">
                <span className={`text-ink ${entry.className}`}>{entry.sample}</span>
                <span className="font-mono text-caption text-ink-muted">{entry.detail}</span>
              </li>
            ))}
          </ul>
        </ClayCard>

        <ClayCard>
          <h2 className="mb-5 text-small font-bold text-ink-soft">Buttons</h2>
          <div className="space-y-3">
            <ClayButton
              className="w-full"
              trailing={<ClayIcon glyph={ArrowRightIcon} size="sm" weight="bold" />}
            >
              Primary
            </ClayButton>
            <ClayButton className="w-full" variant="secondary">
              Secondary
            </ClayButton>
            <ClayButton className="w-full" variant="ghost">
              Ghost
            </ClayButton>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <ClayTag tone="mint">Correct</ClayTag>
            <ClayTag tone="peach">Diagnosing</ClayTag>
            <ClayTag tone="coral">Glitch</ClayTag>
            <ClayTag>Transfer</ClayTag>
          </div>
        </ClayCard>

        <ClayCard className="md:col-span-2">
          <h2 className="mb-5 text-small font-bold text-ink-soft">Tiles</h2>
          <div className="grid grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <ClayTile
                key={subject.label}
                glyph={subject.glyph}
                label={subject.label}
                tone={subject.tone}
              />
            ))}
          </div>
        </ClayCard>

        <ClayCard>
          <h2 className="mb-5 text-small font-bold text-ink-soft">Elevation</h2>
          <div className="space-y-4">
            {elevations.map((entry) => (
              <div
                key={entry.token}
                className={`flex h-14 items-center justify-center rounded-lg bg-surface font-mono text-caption text-ink-muted ${entry.className}`}
              >
                {entry.token}
              </div>
            ))}
          </div>
        </ClayCard>

        <ClayCard className="md:col-span-2">
          <h2 className="mb-5 text-small font-bold text-ink-soft">Progress</h2>
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-small font-bold text-ink">Rule confidence</span>
                <span className="font-mono text-caption text-ink-muted">81%</span>
              </div>
              <ClayProgress value={81} label="Rule confidence" />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-small font-bold text-ink">Transfer</span>
                <span className="font-mono text-caption text-ink-muted">40%</span>
              </div>
              <ClayProgress value={40} label="Transfer" />
            </div>
          </div>
        </ClayCard>

        <ClayCard className="md:col-span-2">
          <h2 className="mb-5 text-small font-bold text-ink-soft">Boss states</h2>
          <div className="flex items-end justify-around gap-8">
            <div className="flex flex-col items-center">
              <Image
                src={bossIdle}
                alt="The Free Ten boss gripping its rod so it cannot come apart"
                width={93}
                height={280}
              />
              <p className="mt-4 font-mono text-caption text-ink-muted">idle</p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src={bossDefeated}
                alt="The Free Ten boss cracking apart after the counterexample"
                width={144}
                height={280}
              />
              <p className="mt-4 font-mono text-caption text-ink-muted">defeated</p>
            </div>
          </div>
        </ClayCard>

        <ClayCard elevation="low">
          <div className="flex items-start gap-3">
            <ClayIcon glyph={CheckCircleIcon} size="lg" className="text-mint-500" />
            <div>
              <p className="text-small font-bold text-ink">Rule defeated</p>
              <p className="mt-1 text-caption text-ink-muted">
                The counterexample broke the pattern and the transfer problem was solved alone.
              </p>
            </div>
          </div>
        </ClayCard>
      </div>
    </main>
  );
}

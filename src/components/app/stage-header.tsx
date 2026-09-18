import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { ClayIcon } from "@/components/clay/clay-icon";
import { ClayTag } from "@/components/clay";

export function StageHeader({ title, stage }: { title: string; stage: number }) {
  return (
    <header className="mb-6 flex items-center gap-3">
      <Link
        href="/lab"
        aria-label="Back to the lab"
        className="clay-interactive flex size-11 shrink-0 items-center justify-center rounded-md bg-surface text-ink shadow-clay-1 active:translate-y-px"
      >
        <ClayIcon glyph={ArrowLeftIcon} size="md" weight="bold" />
      </Link>
      <h1 className="flex-1 text-h2 text-ink">{title}</h1>
      <ClayTag tone="violet">Stage {stage}</ClayTag>
    </header>
  );
}

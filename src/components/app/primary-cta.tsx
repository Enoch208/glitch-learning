import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { ClayIcon } from "@/components/clay/clay-icon";

export function PrimaryCta({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="clay-interactive flex h-14 w-full items-center justify-center rounded-full bg-linear-to-b from-violet-400 to-violet-500 pr-2 pl-6 font-bold text-surface shadow-clay-raised active:translate-y-px active:shadow-clay-pressed"
    >
      <span className="flex-1 text-center">{children}</span>
      <span className="flex size-10 items-center justify-center rounded-full bg-surface text-violet-500">
        <ClayIcon glyph={ArrowRightIcon} size="sm" weight="bold" />
      </span>
    </Link>
  );
}

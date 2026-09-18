"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartBarIcon,
  FlaskIcon,
  HouseIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";
import { ClayIcon, type ClayGlyph } from "@/components/clay/clay-icon";
import { cx } from "@/lib/cx";
import { useHydrated } from "@/lib/use-hydrated";
import { useRunStore } from "@/store/run-store";

const items: { href: string; label: string; glyph: ClayGlyph }[] = [
  { href: "/", label: "Home", glyph: HouseIcon },
  { href: "/run", label: "Run", glyph: FlaskIcon },
  { href: "/progress", label: "Progress", glyph: ChartBarIcon },
  { href: "/profile", label: "Profile", glyph: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const storedSound = useRunStore((state) => state.soundOn);
  const toggleSound = useRunStore((state) => state.toggleSound);
  const soundOn = hydrated && storedSound;

  return (
    <div className="pb-safe relative z-20 w-full shrink-0 px-3">
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? "Sound is on. Turn it off" : "Sound is off. Turn it on"}
        className="clay-interactive absolute -top-6 right-6 flex size-10 items-center justify-center rounded-full bg-surface text-violet-500 shadow-clay-2 active:translate-y-px"
      >
        <ClayIcon glyph={soundOn ? SpeakerHighIcon : SpeakerSlashIcon} size="sm" weight="fill" />
      </button>
      <nav className="rounded-2xl bg-surface p-1.5 shadow-clay-2">
        <ul className="flex items-stretch gap-0.5">
          {items.map((item) => {
            const active = pathname === item.href;

            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "clay-interactive flex h-14 flex-col items-center justify-center gap-0.5 rounded-lg",
                    "active:translate-y-px active:shadow-clay-pressed",
                    active
                      ? "bg-surface text-violet-500 shadow-clay-1"
                      : "text-ink-muted hover:bg-violet-50/70",
                  )}
                >
                  <ClayIcon glyph={item.glyph} size="nav" weight={active ? "fill" : "regular"} />
                  <span className={cx("text-caption", active ? "font-bold" : "font-medium")}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

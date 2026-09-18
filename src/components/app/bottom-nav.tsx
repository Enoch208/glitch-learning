"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartBarIcon, FlaskIcon, HouseIcon, UserIcon } from "@phosphor-icons/react/dist/ssr";
import { ClayIcon, type ClayGlyph } from "@/components/clay/clay-icon";
import { cx } from "@/lib/cx";

const items: { href: string; label: string; glyph: ClayGlyph }[] = [
  { href: "/", label: "Home", glyph: HouseIcon },
  { href: "/lab", label: "Lab", glyph: FlaskIcon },
  { href: "/progress", label: "Progress", glyph: ChartBarIcon },
  { href: "/profile", label: "Profile", glyph: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="pb-safe fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-sm px-3">
      <nav className="rounded-xl bg-surface px-1 py-1.5 shadow-clay-3">
        <ul className="flex items-stretch">
          {items.map((item) => {
            const active = pathname === item.href;

            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "clay-interactive flex h-14 flex-col items-center justify-center gap-1 rounded-md",
                    active ? "text-violet-500" : "text-ink-muted",
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

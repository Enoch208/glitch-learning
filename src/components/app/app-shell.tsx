import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { BottomNav } from "./bottom-nav";

export function AppShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col">
      <main className={cx("min-h-dvh pb-28", className)}>{children}</main>
      <BottomNav />
    </div>
  );
}

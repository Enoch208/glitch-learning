import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { BottomNav } from "./bottom-nav";

export function AppShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="mx-auto w-full max-w-sm sm:py-8">
      <div className="flex h-dvh flex-col overflow-hidden bg-canvas sm:app-frame-height sm:rounded-2xl sm:border sm:border-violet-200 sm:shadow-clay-3">
        <main className={cx("flex-1 overflow-y-auto overscroll-contain pb-14", className)}>
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

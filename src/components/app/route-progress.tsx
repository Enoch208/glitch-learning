"use client";

import { usePathname } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      aria-hidden="true"
      className="route-progress-sweep pointer-events-none fixed inset-x-0 top-0 z-50 h-1 origin-left bg-violet-500 shadow-glow-violet motion-reduce:hidden"
    />
  );
}

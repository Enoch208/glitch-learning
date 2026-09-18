import { useSyncExternalStore } from "react";

const subscribeToNothing = () => () => undefined;

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

import { useCallback } from "react";
import { useRunStore } from "@/store/run-store";
import type { CueName } from "./cues";
import { playCue } from "./play";

export function useCue(): (name: CueName) => void {
  const soundOn = useRunStore((state) => state.soundOn);
  return useCallback(
    (name: CueName) => {
      if (soundOn) playCue(name);
    },
    [soundOn],
  );
}

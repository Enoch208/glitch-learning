import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

export function useTimeline(active: boolean, marks: number[]): number {
  const reduceMotion = useReducedMotion() === true;
  const [reached, setReached] = useState(0);

  useEffect(() => {
    if (!active || reduceMotion) return;
    const timers = marks.map((at, index) =>
      setTimeout(() => {
        setReached(index + 1);
      }, at),
    );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [active, reduceMotion, marks]);

  if (!active) return 0;
  return reduceMotion ? marks.length : reached;
}

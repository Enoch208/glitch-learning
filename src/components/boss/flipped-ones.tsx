import type { SubtractionProblem } from "@/engine/math/truth";
import { cx } from "@/lib/cx";

export function FlippedOnes({
  problem,
  glitching,
  className,
}: {
  problem: SubtractionProblem;
  glitching: boolean;
  className?: string | undefined;
}) {
  const topOnes = String(problem.minuend % 10);
  const bottomOnes = String(problem.subtrahend % 10);

  return (
    <p className={cx("font-mono text-small text-coral-700", className)}>
      Ones:{" "}
      <s>
        {topOnes} &minus; {bottomOnes}
      </s>{" "}
      &rarr;{" "}
      <span className={glitching ? "glitch-fringe" : ""}>
        {bottomOnes} &minus; {topOnes}
      </span>
    </p>
  );
}

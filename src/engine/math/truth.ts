export type SubtractionProblem = {
  minuend: number;
  subtrahend: number;
};

export type ColumnSolution = {
  regrouped: boolean;
  onesTop: number;
  tensTop: number;
  onesResult: number;
  tensResult: number;
  answer: number;
};

const onesDigit = (value: number) => value % 10;
const tensDigit = (value: number) => Math.floor(value / 10);

const isTwoDigit = (value: number) => Number.isInteger(value) && value >= 10 && value <= 99;

export function isTwoDigitSubtraction(problem: SubtractionProblem): boolean {
  return (
    isTwoDigit(problem.minuend) &&
    Number.isInteger(problem.subtrahend) &&
    problem.subtrahend >= 0 &&
    problem.subtrahend <= problem.minuend
  );
}

export function solveByColumns(problem: SubtractionProblem): ColumnSolution {
  if (!isTwoDigitSubtraction(problem)) {
    throw new RangeError(
      `${String(problem.minuend)} - ${String(problem.subtrahend)} is outside the two-digit subtraction domain`,
    );
  }

  const onesBottom = onesDigit(problem.subtrahend);
  const regrouped = onesDigit(problem.minuend) < onesBottom;
  const onesTop = regrouped ? onesDigit(problem.minuend) + 10 : onesDigit(problem.minuend);
  const tensTop = regrouped ? tensDigit(problem.minuend) - 1 : tensDigit(problem.minuend);

  return {
    regrouped,
    onesTop,
    tensTop,
    onesResult: onesTop - onesBottom,
    tensResult: tensTop - tensDigit(problem.subtrahend),
    answer: problem.minuend - problem.subtrahend,
  };
}

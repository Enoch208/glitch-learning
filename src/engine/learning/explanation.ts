export type ConceptStatement = {
  id: string;
  text: string;
  required: boolean;
  followUp: string;
};

export const conceptStatements: ConceptStatement[] = [
  {
    id: "ten-is-ten-ones",
    text: "One ten is worth the same as ten ones.",
    required: true,
    followUp: "How many ones is one ten worth?",
  },
  {
    id: "keep-ten-too",
    text: "You can take ten ones and still keep the ten.",
    required: false,
    followUp: "",
  },
  {
    id: "moves-not-creates",
    text: "Regrouping moves value around. It never makes new value.",
    required: true,
    followUp: "When you regroup, do you get something extra, or move what was there?",
  },
  {
    id: "tens-decrease",
    text: "When a ten turns into ten ones, there is one fewer ten.",
    required: true,
    followUp: "After one ten turns into ones, how many tens are left?",
  },
  {
    id: "small-from-big",
    text: "Always take the smaller digit away from the bigger one.",
    required: false,
    followUp: "",
  },
  {
    id: "total-same",
    text: "After regrouping, the top number is still worth the same.",
    required: true,
    followUp: "Is 52 still 52 after you regroup it?",
  },
];

export const requiredConceptIds = conceptStatements
  .filter((statement) => statement.required)
  .map((statement) => statement.id);

export type ExplanationEvaluation = {
  conceptsPresent: string[];
  conceptsMissing: string[];
  contradiction: boolean;
  coverage: number;
  followUp: string | null;
};

const ACCEPTED_COVERAGE = 0.75;

export function evaluateJudgement(
  present: string[],
  contradiction: boolean,
  attempt: number,
): ExplanationEvaluation {
  const conceptsPresent = requiredConceptIds.filter((id) => present.includes(id));
  const conceptsMissing = requiredConceptIds.filter((id) => !present.includes(id));
  const firstMissing = conceptStatements.find((statement) => statement.id === conceptsMissing[0]);
  const needsMore = conceptsMissing.length > 0 || contradiction;

  return {
    conceptsPresent,
    conceptsMissing,
    contradiction,
    coverage: conceptsPresent.length / requiredConceptIds.length,
    followUp:
      attempt === 1 && needsMore
        ? (firstMissing?.followUp ?? "One of your ideas is something the boss would agree with.")
        : null,
  };
}

export function evaluateConcepts(selected: string[], attempt: number): ExplanationEvaluation {
  const contradiction = conceptStatements.some(
    (statement) => !statement.required && selected.includes(statement.id),
  );
  return evaluateJudgement(selected, contradiction, attempt);
}

export const explanationAccepted = (evaluation: ExplanationEvaluation): boolean =>
  !evaluation.contradiction && evaluation.coverage >= ACCEPTED_COVERAGE;

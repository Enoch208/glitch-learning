import { describe, expect, test } from "vitest";
import {
  conceptStatements,
  evaluateConcepts,
  evaluateJudgement,
  explanationAccepted,
  requiredConceptIds,
} from "@/engine/learning/explanation";

describe("explanation by concept selection", () => {
  test("choosing every required idea covers the explanation fully", () => {
    expect(evaluateConcepts(requiredConceptIds, 1)).toMatchObject({
      coverage: 1,
      contradiction: false,
      followUp: null,
    });
  });

  test("leaving out that the tens go down asks about exactly that", () => {
    const partial = requiredConceptIds.filter((id) => id !== "tens-decrease");
    const result = evaluateConcepts(partial, 1);
    expect(result.conceptsMissing).toEqual(["tens-decrease"]);
    expect(result.followUp).not.toBeNull();
  });

  test("choosing an idea that is false is flagged", () => {
    const decoy = conceptStatements.find((statement) => !statement.required);
    expect(evaluateConcepts([...requiredConceptIds, decoy?.id ?? ""], 1).contradiction).toBe(true);
  });

  test("most of the ideas with nothing false is enough to move on", () => {
    const [, ...threeOfFour] = requiredConceptIds;
    expect(explanationAccepted(evaluateConcepts(threeOfFour, 2))).toBe(true);
  });

  test("an explanation that includes the boss's own idea is not accepted", () => {
    const decoy = conceptStatements.find((statement) => !statement.required);
    expect(explanationAccepted(evaluateConcepts([...requiredConceptIds, decoy?.id ?? ""], 2))).toBe(
      false,
    );
  });

  test("a model judgement is scored the same way as chosen ideas", () => {
    expect(evaluateJudgement(requiredConceptIds, false, 1)).toEqual(
      evaluateConcepts(requiredConceptIds, 1),
    );
  });

  test("a model judging the explanation as agreeing with the boss is a contradiction", () => {
    expect(evaluateJudgement(requiredConceptIds, true, 1).contradiction).toBe(true);
  });

  test("a weak explanation keeps getting a hint instead of passing", () => {
    const second = evaluateConcepts([], 2);
    expect(explanationAccepted(second)).toBe(false);
    expect(second.followUp).not.toBeNull();
    expect(second.followUp).not.toBe(evaluateConcepts([], 1).followUp);
  });

  test("a good explanation needs no follow up", () => {
    expect(evaluateConcepts(requiredConceptIds, 2).followUp).toBeNull();
  });
});

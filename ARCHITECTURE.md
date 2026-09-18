# Architecture

GLITCH is a single Next.js app. The engine under `src/engine` is plain TypeScript with no framework dependency, and all of it is deterministic.

## The boundary

Claude proposes candidate rules and judges which ideas a written explanation contains. It never decides the correct answer, whether a counterexample is valid, whether a transfer problem was solved, or whether the learner has won.

## Model layer

`src/ai` is imported only by the route handlers `/api/model/induce` and `/api/explanation/evaluate`, so no model code or key reaches the browser. Structured outputs cannot describe a recursive schema, so the model returns a fixed wrapper holding each candidate program as JSON text, and GLITCH's own validator decides whether that text is a legal program. A refusal or truncated output counts as a failure. With no key or any failure, induction returns the known rules and explanation falls back to choosing ideas.

An induced rule becomes a boss only through `inducedRuleVerified`: it must pass the validator, reproduce every recorded answer and rewritten digit, and disagree with correct regrouping on at least two problems. The stage machine repeats that check before diagnosis can complete.

## Engine

| Module                                         | Responsibility                                                                                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `math/truth.ts`                                | Canonical column subtraction, including the regrouping steps, and the valid problem domain.                                      |
| `events/trace.ts`, `trace/recorder.ts`         | The schema for each canvas event, and a recorder that stamps and validates events as they arrive.                                |
| `rules/ast.ts`                                 | A closed rule language: constants, the four digits, arithmetic, comparison and a conditional. A validator rejects anything else. |
| `rules/interpreter.ts`                         | Runs a rule on a problem and returns its rewritten digits and answer.                                                            |
| `rules/known-rules.ts`                         | Correct regrouping, Free Ten and Flip Flop, written in the rule language.                                                        |
| `learner/posterior.ts`                         | Model confidence over candidate rules from answers and recorded steps, and the boss gate.                                        |
| `learner/diagnostic.ts`                        | Expected information gain for a candidate problem, and choosing the best one.                                                    |
| `counterexample/search.ts`                     | Judging a problem against a rule, searching for counterexamples, and hints.                                                      |
| `learning/explanation.ts`                      | Checking an explanation by the ideas chosen, with one follow-up.                                                                 |
| `game/session.ts`, `transfer.ts`, `handoff.ts` | Choosing questions during a run, the transfer problem, and the notes for the next tutor.                                         |
| `eval/`                                        | Synthetic learners, baseline strategies and reliability checks.                                                                  |

## The rule language

A rule is four expressions: the rewritten ones digit, the rewritten tens digit, and the two column results. The rewritten digits may only read the problem's digits. The results may also read the rewritten digits. The validator rejects unknown operations, source text in place of a program, self-reference, nesting beyond eight levels, programs over sixty nodes and constants outside small integers. The known rules pass through the same validator any proposed rule would.

Free Ten is correct regrouping without the step that takes one from the tens. That one-node difference is what the boss shows.

## Diagnosis

Each candidate rule predicts an answer and rewritten digits for a problem. An observation matching a rule's prediction is likely under that rule, and slips are allowed for. The next question maximises expected information gain: the drop in entropy over candidate rules, averaged over the answers each rule predicts.

A boss appears only when a misconception leads with confidence of at least 0.75, at least 0.20 ahead of the runner-up, and on at least two problems where it and correct regrouping disagree. The thresholds live in configuration.

## Counterexamples

One search serves three purposes: judging the problem a learner builds in the Forge, producing hints, and choosing the transfer problem. A problem counts as a counterexample only when the rule's answer differs from the truth engine's.

## App

Screens live in `src/app`. Run state (recorded traces, predictions, the forged problem, the explanation and transfer results) is kept in a persisted store on the device. No server stores learner data.

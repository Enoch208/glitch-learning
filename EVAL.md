# Evaluation

Everything here is produced by `pnpm eval`, which writes `evals/results/diagnosis.json`. The `/eval` page reads the same file.

## Setup

- 500 synthetic learners, 125 generated from each of four rules: correct regrouping, Free Ten, Flip Flop, and correct regrouping with frequent careless slips.
- Each learner answers with its own slip rate: a random wrong answer some fraction of the time.
- Each strategy may ask up to 6 questions, drawn from a seeded pool of 30 random two-digit problems per question.
- Seed 2026. The same seed gives the same learners and the same results.

## Strategies

- **GLITCH:** posterior over rules using answers and recorded steps, next question by expected information gain.
- **Random next question:** the same posterior and gate, but questions are chosen at random.
- **Wrong-answer lookup:** a question at random; a boss when the same misconception is the only rule matching the learner's answer twice.
- **Answers only, no steps:** information-gain selection with a posterior that ignores recorded steps.

## Results

| Strategy               | Right outcome | Wrong boss | of which false accusations | Missed misconception | Median questions to boss |
| ---------------------- | ------------- | ---------- | -------------------------- | -------------------- | ------------------------ |
| GLITCH                 | 500           | 0          | 0                          | 0                    | 2                        |
| Random next question   | 442           | 1          | 1                          | 57                   | 4                        |
| Wrong-answer lookup    | 420           | 0          | 0                          | 80                   | 4                        |
| Answers only, no steps | 498           | 2          | 2                          | 0                    | 2                        |

**Right outcome:** a boss for the learner's real misconception, or no boss for a learner who has none. **Wrong boss:** any other boss, including a boss given to a learner with no misconception (a false accusation, counted separately). **Missed:** a learner with a misconception who got no boss within the budget.

## Reading these numbers

- The learners are drawn from the same four rules the model holds. The model is correctly specified by construction, so near-perfect scores are expected and do not show accuracy with real children.
- The comparison between strategies is fair: every strategy faced the same learners from the same seeds.
- Recorded steps matter mostly for avoiding false accusations. Answers alone reached a boss as quickly but accused two learners who had no misconception.

## Reliability

| Check                            | Result          | Checked                                                                          |
| -------------------------------- | --------------- | -------------------------------------------------------------------------------- |
| Arithmetic truth failures        | 0               | 4995 problems                                                                    |
| Rule language vs truth engine    | 0 disagreements | 4995 problems                                                                    |
| Malformed rule programs accepted | 0               | 15 programs                                                                      |
| False counterexamples            | 0               | 3240 counterexamples                                                             |
| Stage order violations accepted  | 0               | 60000 random completion attempts, 5883 accepted, 17 runs reaching the last stage |

Stage transitions are checked by a checker that does not share the machine's guards: every accepted transition must leave the completed stages in order and backed by the evidence that stage needs. Weakening the guard on any one of three stages makes this counter non-zero, which is how it was confirmed to detect violations.

## Latency

Choosing the next question from 30 candidates: P50 0.023 ms, P95 0.029 ms over 400 samples.

## An honest failure

Free Ten and correct regrouping give the same answer whenever a problem needs no regrouping. A learner who only ever sees such problems cannot be told apart. GLITCH therefore refuses to wake a boss until it has seen two problems where the leading misconception and correct regrouping disagree.

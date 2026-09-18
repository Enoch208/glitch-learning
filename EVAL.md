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

## Live model

`pnpm eval:model` calls the real model and writes `evals/results/model.json`. Model `gpt-5.5` at low reasoning effort, 5 runs per scenario.

### Finding rules

Each scenario gives the model a learner's steps on a few problems. A run counts only if a proposed rule passes the same verification a boss must pass, and it is then compared with the true rule on 90 problems it never saw.

| Scenario                                                          | Runs with a verified rule | Runs matching the true rule on 90 unseen problems | Names the model gave                          |
| ----------------------------------------------------------------- | ------------------------- | ------------------------------------------------- | --------------------------------------------- |
| Rule not in the library (writes zero when the ones are too small) | 5 of 5                    | 5 of 5                                            | No Borrow Zero, Zero Hard Ones                |
| Free Ten                                                          | 5 of 5                    | 5 of 5                                            | Add Ten No Borrow, Add Ten Ones, Add Ten Only |

All 10 runs returned output that parsed; the validator rejected 0 of 19 proposed programs. Latency 5543 ms median, 9656 ms P95.

### Reading explanations

Each explanation was labelled in advance with the ideas it must contain and the ideas it may contain. A judgement agrees only if it finds every required idea, adds nothing outside the allowed ones, and gets the contradiction flag right.

| Explanation                                                                         | Ideas found                                    | Agrees |
| ----------------------------------------------------------------------------------- | ---------------------------------------------- | ------ |
| the boss made 12 ones but forgot to take one ten away so the tens should be 4 not 5 | moves-not-creates, tens-decrease               | yes    |
| you can borrow ten ones and still keep all your tens                                | none (contradiction)                           | yes    |
| one ten is the same as ten ones, and 52 is still 52 after you regroup it            | ten-is-ten-ones, total-same                    | yes    |
| I gave the ones ten more but I forgot the ten had to come from somewhere            | moves-not-creates                              | no     |
| when you break a ten you get ten ones, the number doesnt get bigger                 | ten-is-ten-ones, moves-not-creates, total-same | yes    |
| the answer is 24                                                                    | none                                           | yes    |
| i dont know                                                                         | none                                           | yes    |
| regrouping just moves the value around so the total stays the same                  | moves-not-creates, total-same                  | yes    |
| 52 is 5 tens and 2 ones. if you take a ten you have 4 tens and 12 ones              | ten-is-ten-ones, tens-decrease                 | yes    |

8 of 9 agree. Latency 2719 ms median, 5729 ms P95.

### Without the model

With the model unavailable, rule-finding falls back to the known rules and Free Ten still ranks first on Free Ten evidence: confirmed in the same run.

## An honest failure

Free Ten and correct regrouping give the same answer whenever a problem needs no regrouping. A learner who only ever sees such problems cannot be told apart. GLITCH therefore refuses to wake a boss until it has seen two problems where the leading misconception and correct regrouping disagree.

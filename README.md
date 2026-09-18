# GLITCH

**Your mistake becomes the boss.**

Most learning software tells a learner that they are wrong. GLITCH works out the rule that made the wrong answer look right, turns that rule into an opponent, and lets the learner win only by proving the rule wrong.

The first domain is two-digit subtraction with regrouping, for learners aged 8 to 11.

## Why it is different

- **It watches how, not just what.** Every step on the math canvas is recorded: whether a ten was borrowed, whether the tens were reduced, what went in each column.
- **A wrong answer is a hypothesis.** GLITCH holds several candidate rules at once and picks the next problem that best tells them apart, instead of the next problem to practise.
- **The rule becomes the boss.** Once the evidence is strong enough, the learner meets their own rule as a character, sees it copy their work, and predicts what it will do next.
- **Winning takes proof.** The learner builds a problem the boss gets wrong, explains why it broke, and then solves an unseen problem alone. Finishing screens is not enough.
- **No model decides what is true.** Arithmetic, rule execution, counterexample checking and the victory condition are all deterministic code.

## How a run goes

1. **Encounter.** The learner works a subtraction problem on the canvas.
2. **Observation.** GLITCH records each step, not only the answer.
3. **Diagnostic.** Follow-up problems are chosen by expected information gain over the candidate rules.
4. **Boss.** A misconception that clears the confidence gate becomes the boss, copies the learner's work, and is predicted by them.
5. **Forge.** The learner builds a problem, digit by digit, that the boss gets wrong.
6. **Explain.** The learner picks the ideas that explain why the boss broke.
7. **Transfer.** The learner solves a new problem the rule would still get wrong.

A learner who regroups correctly throughout gets no boss: GLITCH says there is no rule to break.

## Evidence

500 seeded synthetic learners, a quarter following each candidate rule, each allowed up to 6 questions. Every strategy faced the same learners.

| Strategy               | Right outcome | Wrong boss | of which false accusations | Missed misconception | Median questions to boss |
| ---------------------- | ------------- | ---------- | -------------------------- | -------------------- | ------------------------ |
| GLITCH                 | 500           | 0          | 0                          | 0                    | 2                        |
| Random next question   | 442           | 1          | 1                          | 57                   | 4                        |
| Wrong-answer lookup    | 420           | 0          | 0                          | 80                   | 4                        |
| Answers only, no steps | 498           | 2          | 2                          | 0                    | 2                        |

These learners follow the same rules the model knows, so this shows the machinery works. It does not measure accuracy with real children. More in [EVAL.md](EVAL.md).

Reliability, measured by `pnpm eval`: 0 arithmetic failures across 4995 problems, 0 of 15 malformed rule programs accepted, 0 false counterexamples out of 3240 checked. Choosing the next question takes 0.029 ms at the 95th percentile.

## Architecture

A rule is a small program in a closed language that the interpreter owns. Diagnosis is a posterior over rules plus information-gain question selection. The counterexample search serves the Forge, its hints and the transfer problem. See [ARCHITECTURE.md](ARCHITECTURE.md).

## Limitations

See [KNOWN_LIMITS.md](KNOWN_LIMITS.md). The most important: nothing has been tested with real learners, and the model path has not yet been measured live.

## Run locally

Requires Node 24 and pnpm 10.

```
pnpm install
pnpm dev          # http://localhost:3000, best at phone width
pnpm test         # unit tests
pnpm eval         # regenerate evals/results/diagnosis.json
pnpm eval:model   # live model check, needs ANTHROPIC_API_KEY in .env.local
```

The app runs fully without a key. Adding `ANTHROPIC_API_KEY` to `.env.local` lets Claude propose rules the library does not contain and read written explanations.

`/judges` starts a guided run. `/lab` shows the model's view of the current session. `/eval` shows the measurements above.

Also: [SAFETY.md](SAFETY.md), [DISCLOSURES.md](DISCLOSURES.md), [THIRD_PARTY.md](THIRD_PARTY.md).

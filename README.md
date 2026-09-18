<div align="center">

# GLITCH

**Your mistake becomes the boss.**

A K–5 math game that works out the rule behind a child's wrong answers, turns that rule into an opponent with a face and a behaviour, and lets the child win only by proving it wrong.

[**Play the 90-second case**](https://glitch-learning-pi.vercel.app/judges) · [Look inside a session](https://glitch-learning-pi.vercel.app/lab) · [Measured results](https://glitch-learning-pi.vercel.app/eval)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/146_tests-Vitest-6E9F18?logo=vitest&logoColor=white)
![Evaluation](https://img.shields.io/badge/eval-500%2F500_right_outcome-37b37f)

</div>

## Watch the demo

https://github.com/user-attachments/assets/14295e3e-6b55-4911-a6f3-8cec23465df5

_Two minutes: a wrong answer, the rule hiding inside it, the boss it becomes, and a child breaking it._

![A run in GLITCH: the home screen, working a problem, the boss reveal and breaking the rule in the Forge](docs/screenshots/run.webp)

## Contents

- [The idea](#the-idea)
- [Try it in 90 seconds](#try-it-in-90-seconds)
- [Why it is different](#why-it-is-different)
- [Every wrong rule has a behaviour](#every-wrong-rule-has-a-behaviour)
- [How a run works](#how-a-run-works)
- [AI proposes, code decides](#ai-proposes-code-decides)
- [Progression and mastery](#progression-and-mastery)
- [For tutors](#for-tutors)
- [Learning science](#learning-science)
- [Evaluation](#evaluation)
- [Built for children](#built-for-children)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [What's next](#whats-next)
- [FAQ](#faq)
- [Documentation](#documentation)

## The idea

A child answers **52 − 28 = 34**.

Most math apps see that and say _wrong_. GLITCH asks a different question: **what rule would make 34 look right?**

The child's recorded steps show what happened. They made 12 ones, but never took the ten they used from the tens. Follow that rule and 34 is exactly what you get. So GLITCH gives the rule a name and a body, **Free Ten** ("takes ten, keeps the ten"), and makes it the boss. The child predicts what the boss will say, builds a problem the boss gets wrong, explains why it broke, and then solves a new problem on their own. Only then is the rule defeated.

> Traditional adaptive learning changes the next question.
> GLITCH changes the learner's relationship with the mistake.

The first domain is two-digit subtraction with regrouping, for learners aged 8 to 11.

## Try it in 90 seconds

**[glitch-learning-pi.vercel.app/judges](https://glitch-learning-pi.vercel.app/judges)**

No login, no setup, phone-sized. The page opens with the 52 − 28 story, then **Start the case** walks you through one learner's reasoning on the real engine: two problems, a boss, a trap, an explanation and a final round.

Then play it your own way from the home screen:

- Regroup correctly and **no boss appears**. GLITCH will not accuse a learner who has no rule to fight.
- Take the smaller digit from the bigger one in each column and a different boss, **Flip Flop**, wakes up instead.
- Open **Ones get 10 more** without **Tens give 1 away** and you will meet Free Ten.

The same engine decides every time. `/judges` also runs three learners through the diagnosis as the page loads, so you can see two different bosses and one no-boss side by side.

## Why it is different

|                                  | A typical adaptive tutor   | GLITCH                                                                                    |
| -------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------- |
| What it looks at                 | The final answer           | Every step: the borrow, the rewritten digits, the column answers                          |
| What a wrong answer means        | A point off, a lower level | A hypothesis about the rule the child is following                                        |
| How it chooses the next question | Difficulty                 | Where the candidate rules **disagree most** (expected information gain)                   |
| What the child sees              | "Wrong. Try again."        | A boss that behaves like their own mistake                                                |
| How the child wins               | Getting enough right       | Predicting the rule, breaking it with a counterexample, explaining it, and transferring   |
| What the tutor gets              | A score                    | Evidence: which rule, where it showed, what was broken, what was proven, what to do next  |
| What the AI decides              | Often everything           | Nothing about truth. It proposes rules and reads explanations; deterministic code decides |

## Every wrong rule has a behaviour

The bosses are not mascots. Each one is an executable rule, and each one **does** its rule on screen with real tens and ones.

| Boss          | The rule it follows                                                            | What you see                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Free Ten**  | Gives the ones ten more, but never takes one from the tens                     | Ten ones appear, the ten-rod stays. 52 becomes 62 and the pieces glitch                                                                                   |
| **Flip Flop** | Always takes the smaller digit from the bigger one, so it never has to regroup | The ones swap places: 1 − 5 becomes 5 − 1                                                                                                                 |
| **???**       | A rule GLITCH has not seen before                                              | When the known rules do not fit, the model proposes a new one in a closed rule language, and it becomes a boss only after deterministic checks confirm it |

The boss reveal is earned, not scripted. GLITCH replays the child's own step on the tray, the pieces reach the wrong total, the stuck ten jitters, and it wakes up. In the Forge the boss performs its rule on the child's problem next to the real math, the two answers clash, and the boss cracks.

## How a run works

| Stage               | What happens                                                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Solve            | The learner works a subtraction problem with tens and ones, step by step.                                                                          |
| 2. Clue             | GLITCH records each step, not only the answer.                                                                                                     |
| 3. Test the pattern | Follow-up problems are chosen where the candidate rules' answers disagree most (expected information gain); the posterior then uses the steps too. |
| 4. Boss             | A rule that clears the evidence gate becomes the boss, replays the learner's own step, and is predicted by them.                                   |
| 5. Forge            | The learner builds a problem, digit by digit, that the boss gets wrong, and watches the rule fail against the real math.                           |
| 6. Why              | The learner says why the boss broke, in their own words or by choosing ideas. A weak explanation gets a hint, never a pass.                        |
| 7. Prove it         | One last problem. No boss, no hints. The answer **and** the regrouping steps must both be right.                                                   |

A boss appears only when one rule explains the learner on at least two problems where that rule and correct regrouping disagree. A learner who regroups correctly throughout never gets a boss.

## AI proposes, code decides

The model has exactly two jobs:

1. **Propose candidate rules** when the known ones do not fit. It emits small programs in a fixed rule language, never code. Every proposal is schema-validated, executed against the learner's observed steps and against unseen problems, and scored. A rule becomes a boss only if it survives.
2. **Read the learner's explanation** in their own words and map it to the ideas it must contain.

Everything else is deterministic TypeScript: the arithmetic truth engine, the rule interpreter, the posterior over hypotheses, question selection, counterexample validation, the stage machine and the victory condition. The model never determines the correct answer, whether a counterexample is valid, whether a transfer passed, or whether a child "understands". Every model call has a deterministic fallback, so a run finishes even with the provider down.

`/lab` shows this live during a session: the observed steps, the candidate rules, how sure the engine is, and why it asked the next question. Full detail in [ARCHITECTURE.md](ARCHITECTURE.md).

## Progression and mastery

Progress in GLITCH is not points. It is a **Glitch Book** of rules the learner has found and defeated.

- A rule is **found** when it wakes up as a boss.
- A rule is **defeated** only when the learner has broken it with their own counterexample and then solved a new problem without it, with the right steps.
- Undiscovered rules show as silhouettes, so there is always something left to find.

Defeated means repaired. That is the only way to earn it.

## For tutors

Every run ends with an evidence sheet, built only from what was recorded:

- Rule fits 2 of 2 answers
- Predicted the boss
- Built a counterexample: 45 − 18, rule says 37, truth 27
- Explained the break: 4 of 4 key ideas
- Solved a new problem with the right steps: 25 − 19 → 6
- Next step: try regrouping across a zero, like 60 − 27

The game was for the learner. This is the evidence for the tutor.

## Learning science

Children's subtraction errors are often systematic rules, not random slips. Brown and Burton's work on procedural "bugs" (_Diagnostic models for procedural bugs in basic mathematical skills_, Cognitive Science, 1978) showed that many wrong answers come from a consistent, slightly broken procedure, and argued for explaining why an error happens instead of only marking it. VanLehn's _Mind Bugs_ (MIT Press, 1990) catalogued the same families GLITCH models, including taking the smaller digit from the larger (Flip Flop) and regrouping without taking one from the tens (Free Ten).

GLITCH takes that old insight and turns the learner's rule into something they can see, predict, challenge and disprove. The model proposes what the learner might believe; the learner's own steps and deterministic math decide whether that belief is real.

## Evaluation

Every number below is produced by `pnpm eval` and shown on the live [`/eval`](https://glitch-learning-pi.vercel.app/eval) page. Nothing is claimed that is not measured.

### Diagnosis against three baselines

500 seeded synthetic learners, a quarter following each candidate rule, each allowed up to 6 questions. Every strategy faced the same learners.

| Strategy               | Right outcome | Wrong boss | Missed misconception | Median questions to boss |
| ---------------------- | ------------- | ---------- | -------------------- | ------------------------ |
| **GLITCH**             | **500 / 500** | **0**      | **0**                | **2**                    |
| Random next question   | 442 / 500     | 1          | 57                   | 4                        |
| Wrong-answer lookup    | 420 / 500     | 0          | 80                   | 4                        |
| Answers only, no steps | 498 / 500     | 2          | 0                    | 2                        |

Recorded steps matter most for avoiding false accusations: answers alone reached a boss as fast, but accused two learners who had no misconception.

### No boss when no single rule fits

| Learner                                                        | No boss    |
| -------------------------------------------------------------- | ---------- |
| Careless: correct regrouping, a random slip on half of answers | 500 of 500 |
| Random answers                                                 | 479 of 500 |
| Mixed rules: a different rule on each problem                  | 179 of 500 |

The last row is an honest weakness: a learner who switches rules problem by problem still gets a boss most of the time. The boss page shows how many of the learner's answers the rule explains, so the partial fit is visible, but the gate itself does not yet hold back.

### Live model

`pnpm eval:model` calls the real model (gpt-5.5, 10 rule-finding runs, 9 labelled explanations):

| Model check                                                 | Result                  |
| ----------------------------------------------------------- | ----------------------- |
| Rule-finding output that parsed                             | 10 of 10 runs           |
| Proposed programs rejected by the validator                 | 0 of 19                 |
| Runs that found a rule passing verification                 | 10 of 10                |
| Runs whose rule matched the true rule on 90 unseen problems | 10 of 10                |
| Explanations judged as labelled                             | 8 of 9                  |
| Rule-finding latency                                        | 5.5 s median, 9.7 s P95 |
| Explanation latency                                         | 2.7 s median, 5.7 s P95 |

### Reliability

| Check                            | Result                                                     |
| -------------------------------- | ---------------------------------------------------------- |
| Arithmetic failures              | 0 across 4995 problems                                     |
| Malformed rule programs accepted | 0 of 15                                                    |
| False counterexamples            | 0 of 3240                                                  |
| Stage order violations           | 0 across 60000 attempts, checked by an independent checker |
| Choosing the next question       | 0.03 ms at P95                                             |

These learners follow the rules the model already knows, so the scores show the machinery works, not accuracy with real children. No claims are made about real children.

## Built for children

- No chat, no ads, no accounts, no outbound links in learner mode.
- No labelling. Copy says "this rule seems to explain your steps", never "you misunderstand".
- No correctness shown mid-diagnosis, so a child is not steered while GLITCH is still listening.
- WCAG AA contrast, full keyboard use, reduced motion respected, a mute button on every screen, and manipulatives that work by tapping, not dragging.
- The demo identity is `Learner 01`. No real names, emails or voice.

Details in [SAFETY.md](SAFETY.md).

## Screenshots

![Victory with notes for the next tutor, the lab inspector showing model confidence, and the evaluation page](docs/screenshots/evidence.webp)

`/judges` starts a guided run. `/lab` shows what the engine believes during a session. `/eval` shows the measurements above.

## Tech stack

| Area       | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router), React 19                             |
| Language   | TypeScript 5.9, strict                                        |
| Styling    | Tailwind CSS 4 with a token system, enforced by a design test |
| Motion     | Motion, with reduced-motion fallbacks                         |
| State      | Zustand, persisted on the device                              |
| Validation | Zod                                                           |
| Model      | OpenAI `gpt-5.5` through the OpenAI SDK, server side only     |
| Testing    | Vitest, 146 tests mirroring the engine                        |

## Getting started

### Prerequisites

- Node.js 24
- pnpm 10

### Install and run

```bash
git clone https://github.com/Enoch208/glitch-learning.git
cd glitch-learning
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The app is designed for phone width.

### Environment variables

The app runs fully without any configuration. To let the model propose new rules and read written explanations, create `.env.local`:

```bash
OPENAI_API_KEY=your-key
```

The key is read on the server only and never sent to the browser.

## Scripts

| Command                 | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `pnpm dev`              | Start the development server                       |
| `pnpm build`            | Build for production                               |
| `pnpm start`            | Serve the production build                         |
| `pnpm test`             | Run the unit tests                                 |
| `pnpm test <path>`      | Run one test file or folder                        |
| `pnpm test -t "<name>"` | Run tests whose name matches                       |
| `pnpm eval`             | Regenerate `evals/results/diagnosis.json`          |
| `pnpm eval:model`       | Check the live model path (needs `OPENAI_API_KEY`) |
| `pnpm verify`           | Lint, typecheck, test, build and eval in one go    |
| `pnpm lint`             | Lint, including the no-comments rule               |
| `pnpm typecheck`        | Type-check                                         |
| `pnpm format`           | Format with Prettier                               |

## Project structure

```
src/
  app/            screens, /judges, /lab, /eval and the two API routes
  ai/             model calls, server side only
  components/     app shell, canvas, clay primitives, boss and forge replays
  events/         trace schema shared by canvas and engine
  engine/
    math/         truth engine for column subtraction
    rules/        rule language, interpreter, known rules, induction
    learner/      posterior, information gain, synthetic learners
    counterexample/  search and Forge evaluation
    game/         session, stage machine, transfer, tutor handoff
    eval/         baselines, abstention, reliability checks
  store/          run state
evals/            evaluation entry points and results
tests/            unit tests mirroring the engine
```

## What's next

- More bosses with visible behaviours: Slip (a digit falls out of place) and Short Stop (the regroup is interrupted halfway).
- Regrouping across a zero, then three-digit subtraction, with the same engine.
- A tighter gate for learners who switch rules problem by problem.
- A tutor-side view of the evidence sheet.
- A properly consented study with real learners. Until then, no claims about children.

## FAQ

**Is the boss scripted?**
No. The boss is the rule the engine found in the learner's steps, executed live. Regroup correctly and no boss appears. Use a different rule and a different boss appears. `/judges` runs three learners through the same diagnosis on load to show it.

**Does the AI decide whether the child is right?**
Never. The model proposes candidate rules and reads explanations. Arithmetic, rule execution, counterexample validity, the stage machine and every win are deterministic code.

**What if the model is down?**
The run still finishes. Rule-finding falls back to the known rules and explanations fall back to choosing ideas from a list. Everything the child sees is written copy, never generated text.

**Why only subtraction with regrouping?**
It is the smallest domain with rich, well-documented misconceptions and a real place-value story to tell with pieces. The approach carries: steps as evidence, rules as small programs, bosses as executable rules, counterexamples as the proof. The rule language would need new primitives for each new operation.

**Is it accessible?**
Keyboard throughout, reduced motion, AA contrast, no colour-only meaning, text for every sound, and manipulatives that work by tapping.

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md): the engine, the rule language and the model boundary
- [SAFETY.md](SAFETY.md): design choices that protect children
- [THIRD_PARTY.md](THIRD_PARTY.md): dependencies and their licences

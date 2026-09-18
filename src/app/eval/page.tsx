import results from "../../../evals/results/diagnosis.json";
import { AppShell } from "@/components/app/app-shell";
import { InstrumentSection, Reading } from "@/components/app/instrument";
import type { StrategyReport } from "@/engine/eval/diagnose";

const reports: StrategyReport[] = results.reports.map((report) => ({
  ...report,
  strategy: report.strategy as StrategyReport["strategy"],
}));

const strategyNames: Partial<Record<string, string>> = {
  glitch: "GLITCH",
  "random-question": "Random next question",
  "answer-lookup": "Wrong answer lookup",
  "answer-only": "Answers only, no steps",
};

const knownLimits = [
  "The synthetic learners follow the same four rules the model knows, so these numbers show the machinery works, not how accurate it is with real children.",
  "Free Ten and correct regrouping give the same answer when no regrouping is needed. GLITCH will not wake a boss until it has seen two problems where they disagree.",
  "Explanation is checked by choosing ideas, not by reading free text. No language model is connected yet.",
];

export default function EvalPage() {
  const reliability = results.reliability;

  return (
    <AppShell className="space-y-5 px-5 pt-8">
      <header>
        <p className="font-mono text-caption tracking-widest text-violet-500 uppercase">
          Evaluation
        </p>
        <h1 className="mt-2 text-h1 text-ink">Measured, not claimed</h1>
        <p className="mt-2 text-small text-ink-muted">
          {reports[0]?.learners ?? 0} seeded synthetic learners, up to{" "}
          {results.options.maxQuestions} questions each. Seed {results.options.seed}. Regenerate
          with <code className="font-mono">pnpm eval</code>.
        </p>
      </header>

      <InstrumentSection title="Diagnosis">
        {reports.map((report) => (
          <div key={report.strategy} className="border-b border-violet-50 py-3 last:border-0">
            <p className="text-small font-bold text-ink">
              {strategyNames[report.strategy] ?? report.strategy}
            </p>
            <div className="mt-1 grid grid-cols-4 gap-2 font-mono text-caption text-ink-soft tabular-nums">
              <span>right {report.correct}</span>
              <span>wrong {report.wrongBoss}</span>
              <span>missed {report.missed}</span>
              <span>q {report.medianQuestionsToBoss ?? "none"}</span>
            </div>
          </div>
        ))}
        <p className="mt-3 text-caption text-ink-muted">
          Right means a boss for the learner&rsquo;s real misconception, or no boss when there was
          none. Wrong includes giving a boss to a learner with no misconception. q is the median
          number of questions before a boss appeared.
        </p>
      </InstrumentSection>

      <InstrumentSection title="Reliability">
        <Reading
          label="Math truth failures"
          value={String(reliability.mathTruthFailures)}
          note={`${String(reliability.problemsChecked)} problems checked`}
        />
        <Reading
          label="Correct rule disagreements"
          value={String(reliability.correctRuleDisagreements)}
          note="rule language vs truth engine"
        />
        <Reading
          label="Invalid programs accepted"
          value={String(reliability.invalidProgramsAccepted)}
          note={`${String(reliability.invalidProgramsTried)} malformed programs tried`}
        />
        <Reading
          label="False counterexamples"
          value={String(reliability.falseCounterexamples)}
          note={`${String(reliability.counterexamplesChecked)} counterexamples checked`}
        />
        <Reading
          label="Stage order violations accepted"
          value={String(reliability.stageViolationsAccepted)}
          note={`${String(reliability.stageAttempts)} random completion attempts, checked independently`}
        />
      </InstrumentSection>

      <InstrumentSection title="Latency">
        <Reading
          label="Choosing the next question, P50"
          value={`${String(results.diagnosticSelectionMs.p50)} ms`}
        />
        <Reading
          label="Choosing the next question, P95"
          value={`${String(results.diagnosticSelectionMs.p95)} ms`}
          note="budget 150 ms"
        />
      </InstrumentSection>

      <InstrumentSection title="Known limits">
        <ul className="space-y-3">
          {knownLimits.map((limit) => (
            <li key={limit} className="text-small text-ink-soft">
              {limit}
            </li>
          ))}
        </ul>
      </InstrumentSection>
    </AppShell>
  );
}

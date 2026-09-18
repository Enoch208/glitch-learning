import type { ReasoningTrace } from "@/events/trace";

const describeEvent = (event: ReasoningTrace["events"][number]): string => {
  switch (event.type) {
    case "borrow":
      return "brought ten ones across";
    case "digit_edit":
      return `changed the ${event.place} digit to ${String(event.value)}`;
    case "column_result":
      return `wrote ${String(event.value)} in the ${event.place}`;
    case "answer":
      return `answered ${String(event.value)}`;
    case "hint":
      return `asked for hint ${String(event.level)}`;
  }
};

export function TraceReview({ trace }: { trace: ReasoningTrace }) {
  return (
    <section className="rounded-xl bg-surface p-5 shadow-clay-1">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-small font-bold text-ink-soft">What GLITCH saw</h2>
        <span className="font-mono text-caption text-ink-muted">
          {trace.problem.minuend} &minus; {trace.problem.subtrahend}
        </span>
      </div>
      <ol className="space-y-2">
        {trace.events.map((event, index) => (
          <li
            key={`${event.type}-${String(index)}`}
            className="flex gap-3 font-mono text-caption text-ink-soft"
          >
            <span className="text-ink-muted">{index + 1}</span>
            <span>{describeEvent(event)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

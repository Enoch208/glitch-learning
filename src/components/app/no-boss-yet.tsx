import { PrimaryCta } from "./primary-cta";

export function NoBossYet() {
  return (
    <section className="rounded-xl bg-surface p-5 text-center shadow-clay-1">
      <p className="text-body font-bold text-ink">There is no rule to fight yet.</p>
      <p className="mt-2 text-small text-ink-muted">Answer a few problems first.</p>
      <div className="mt-5">
        <PrimaryCta href="/play">Start answering</PrimaryCta>
      </div>
    </section>
  );
}

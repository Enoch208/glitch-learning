"use client";

import Image from "next/image";
import { ArrowCounterClockwiseIcon, SpeakerHighIcon } from "@phosphor-icons/react/dist/ssr";
import avatarLearner from "@/assets/clay/avatar-learner.webp";
import { AppShell } from "@/components/app/app-shell";
import { ClaySwitch } from "@/components/app/clay-switch";
import { ClayIcon } from "@/components/clay/clay-icon";
import { useHydrated } from "@/lib/use-hydrated";
import { useRunStore } from "@/store/run-store";

export default function ProfilePage() {
  const hydrated = useHydrated();
  const soundOn = useRunStore((state) => state.soundOn);
  const toggleSound = useRunStore((state) => state.toggleSound);
  const resetRun = useRunStore((state) => state.resetRun);
  const completedStageIds = useRunStore((state) => state.completedStageIds);

  const done = hydrated ? completedStageIds.length : 0;

  return (
    <AppShell className="px-5 pt-8">
      <header className="mb-8 flex flex-col items-center text-center">
        <span className="flex size-24 items-end justify-center overflow-hidden rounded-full bg-violet-100 shadow-clay-2 ring-4 ring-surface">
          <Image src={avatarLearner} alt="" width={86} height={112} className="translate-y-2" />
        </span>
        <h1 className="mt-4 text-h1 text-ink">Learner 01</h1>
        <p className="mt-1 text-small text-ink-muted">
          {done} {done === 1 ? "stage" : "stages"} finished
        </p>
      </header>

      <section className="mb-6">
        <h2 className="mb-3 text-body font-bold text-ink">Settings</h2>
        <div className="flex items-center gap-3 rounded-md bg-surface p-4 shadow-clay-1">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-violet-50 text-violet-500">
            <ClayIcon glyph={SpeakerHighIcon} size="md" weight="fill" />
          </span>
          <span className="flex-1">
            <span className="block text-small font-bold text-ink">Sound</span>
            <span className="block text-caption text-ink-muted">
              {hydrated && soundOn ? "On" : "Off"}
            </span>
          </span>
          <ClaySwitch on={hydrated ? soundOn : false} onToggle={toggleSound} label="Sound" />
        </div>
        <p className="mt-3 text-caption text-ink-muted">
          Motion follows your device&rsquo;s reduce motion setting.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-body font-bold text-ink">Start over</h2>
        <button
          type="button"
          onClick={resetRun}
          className="clay-interactive flex h-14 w-full items-center gap-3 rounded-md bg-surface px-4 text-left text-small font-bold text-ink-soft shadow-clay-1 active:translate-y-px"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-coral-100 text-coral-700">
            <ClayIcon glyph={ArrowCounterClockwiseIcon} size="md" weight="bold" />
          </span>
          Reset this run
        </button>
      </section>

      <section>
        <h2 className="mb-3 text-body font-bold text-ink">Privacy</h2>
        <div className="rounded-md bg-surface p-4 shadow-clay-1">
          <p className="text-small text-ink-soft">
            No account, no email, no real name. Your work stays on this device.
          </p>
        </div>
      </section>
    </AppShell>
  );
}

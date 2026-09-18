# Known limits

- **The model path is not yet measured live.** Rule induction and explanation reading run through Claude when a key is configured, and `pnpm eval:model` records their latency and agreement, but no results are published yet. Boss dialogue is prewritten, not generated.
- **Evaluated on synthetic learners only.** The learners follow the same rules the model knows, so the evaluation shows the machinery works, not accuracy with real children. No real learners have used GLITCH.
- **Three rules.** The candidate set is correct regrouping, Free Ten, Flip Flop and careless slips. A learner following some other rule will usually end with no boss.
- **Free Ten needs regrouping problems to show itself.** On problems without regrouping it gives the same answers as correct regrouping. GLITCH will not wake a boss until two discriminating problems have been answered.
- **Only Free Ten has a boss character.** Other rules appear as their rule piece.
- **Sound is minimal.** Five short synthesised cues, no music and no recorded audio.
- **One device.** Progress is stored in the browser and does not follow the learner.
- **The base ten canvas at `/canvas` is a separate demonstration** of regrouping by composition, not part of the run.

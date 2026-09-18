# Known limits

- **The model is slower than intended.** Finding a new rule takes 5.5 s at the median and 9.7 s at P95, against a 2.5 s goal. Reading an explanation takes 2.7 s at the median. The run shows that it is testing possible rules while it waits.
- **The model eval is small.** 10 rule-finding runs over two rules and 9 hand-labelled explanations. It missed one explanation: "I gave the ones ten more but I forgot the ten had to come from somewhere" was not read as saying the tens go down.
- **Different rules can fit the same evidence.** If every problem seen needs regrouping, a rule that always writes zero in the ones fits as well as one that writes zero only when stuck. GLITCH accepts a proposed rule only if it reproduces every step, but it does not yet ask an extra question to separate two proposed rules that both fit.
- **Boss dialogue is prewritten**, not generated.
- **Evaluated on synthetic learners only.** The learners follow the same rules the model knows, so the evaluation shows the machinery works, not accuracy with real children. No real learners have used GLITCH.
- **Three rules.** The candidate set is correct regrouping, Free Ten, Flip Flop and careless slips. A learner following some other rule will usually end with no boss.
- **Free Ten needs regrouping problems to show itself.** On problems without regrouping it gives the same answers as correct regrouping. GLITCH will not wake a boss until two discriminating problems have been answered.
- **Only Free Ten has a boss character.** Other rules appear as their rule piece.
- **Sound is minimal.** Five short synthesised cues, no music and no recorded audio.
- **One device.** Progress is stored in the browser and does not follow the learner.
- **The base ten canvas at `/canvas` is a separate demonstration** of regrouping by composition, not part of the run.

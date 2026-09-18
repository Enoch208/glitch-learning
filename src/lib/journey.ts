export type StageStatus = "done" | "active" | "locked";

export type JourneyStage = {
  id: string;
  index: number;
  title: string;
  detail: string;
  status: StageStatus;
  href?: string;
};

export const journeyStages: JourneyStage[] = [
  {
    id: "encounter",
    index: 1,
    title: "Encounter",
    detail: "Work one out",
    status: "active",
    href: "/play",
  },
  { id: "observation", index: 2, title: "Observation", detail: "GLITCH watches", status: "locked" },
  {
    id: "diagnostic",
    index: 3,
    title: "Diagnostic",
    detail: "One sharp question",
    status: "locked",
  },
  { id: "boss", index: 4, title: "Boss", detail: "Your rule wakes up", status: "locked" },
  { id: "forge", index: 5, title: "Forge", detail: "Break the rule", status: "locked" },
  { id: "explain", index: 6, title: "Explain", detail: "Say why it broke", status: "locked" },
  { id: "transfer", index: 7, title: "Transfer", detail: "On your own", status: "locked" },
];

export type RuleGlyphName = "stack" | "swap" | "slip" | "halt";

export type RuleCard = {
  id: string;
  name: string;
  hint: string;
  tone: "violet" | "mint" | "peach" | "coral" | "sky" | "rose";
  glyph: RuleGlyphName;
  unlocked: boolean;
};

export const ruleLibrary: RuleCard[] = [
  {
    id: "free-ten",
    name: "Free Ten",
    hint: "Takes ten, keeps the ten",
    tone: "mint",
    glyph: "stack",
    unlocked: true,
  },
  {
    id: "flip-flop",
    name: "Flip Flop",
    hint: "Always small from big",
    tone: "peach",
    glyph: "swap",
    unlocked: false,
  },
  {
    id: "slip",
    name: "Slip",
    hint: "One careless step",
    tone: "sky",
    glyph: "slip",
    unlocked: false,
  },
  {
    id: "short-stop",
    name: "Short Stop",
    hint: "Stops borrowing early",
    tone: "coral",
    glyph: "halt",
    unlocked: false,
  },
];

export const completedStages = journeyStages.filter((stage) => stage.status === "done").length;

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
    title: "Solve",
    detail: "Work one out",
    status: "active",
    href: "/play",
  },
  {
    id: "observation",
    index: 2,
    title: "Clue",
    detail: "GLITCH spots the pattern",
    status: "locked",
  },
  {
    id: "diagnostic",
    index: 3,
    title: "Test the pattern",
    detail: "One more clue",
    status: "locked",
    href: "/play",
  },
  {
    id: "boss",
    index: 4,
    title: "Boss",
    detail: "A strange rule wakes up",
    status: "locked",
    href: "/boss",
  },
  {
    id: "forge",
    index: 5,
    title: "Forge",
    detail: "Trap the boss",
    status: "locked",
    href: "/forge",
  },
  {
    id: "explain",
    index: 6,
    title: "Why?",
    detail: "Say why it broke",
    status: "locked",
    href: "/explain",
  },
  {
    id: "transfer",
    index: 7,
    title: "Prove it",
    detail: "One last one, no hints",
    status: "locked",
    href: "/transfer",
  },
];

export type RuleGlyphName = "stack" | "swap" | "found";

export type RuleCard = {
  id: string;
  name: string;
  hint: string;
  tone: "violet" | "mint" | "peach" | "coral" | "sky" | "rose";
  glyph: RuleGlyphName;
};

export const ruleLibrary: RuleCard[] = [
  {
    id: "free-ten",
    name: "Free Ten",
    hint: "Takes ten, keeps the ten",
    tone: "mint",
    glyph: "stack",
  },
  {
    id: "flip-flop",
    name: "Flip Flop",
    hint: "Always small from big",
    tone: "peach",
    glyph: "swap",
  },
];

export const completedStages = journeyStages.filter((stage) => stage.status === "done").length;

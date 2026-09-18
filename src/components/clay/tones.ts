export const toneSurfaces = {
  violet: "bg-violet-50",
  mint: "bg-mint-100",
  peach: "bg-peach-100",
  coral: "bg-coral-100",
  lilac: "bg-lilac-100",
  sky: "bg-sky-100",
  rose: "bg-rose-100",
} as const;

export const toneAccents = {
  violet: "text-violet-500",
  mint: "text-mint-500",
  peach: "text-peach-500",
  coral: "text-coral-500",
  lilac: "text-violet-400",
  sky: "text-violet-400",
  rose: "text-coral-500",
} as const;

export const toneInks = {
  violet: "text-violet-600",
  mint: "text-mint-700",
  peach: "text-peach-700",
  coral: "text-coral-700",
  lilac: "text-violet-600",
  sky: "text-violet-600",
  rose: "text-coral-700",
} as const;

export type ClayTone = keyof typeof toneSurfaces;

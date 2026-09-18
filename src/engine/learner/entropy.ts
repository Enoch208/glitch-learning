export const entropy = (distribution: number[]): number =>
  0 - distribution.reduce((sum, p) => (p > 0 ? sum + p * Math.log2(p) : sum), 0);

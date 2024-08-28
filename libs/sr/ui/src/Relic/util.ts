export const relicLevelVariant = (level: number) =>
  ('roll' + (Math.floor(Math.max(level, 0) / 3) + 1)) as RollColorKey

export const allRollColorKeys = [
  'roll1',
  'roll2',
  'roll3',
  'roll4',
  'roll5',
  'roll6',
] as const
export type RollColorKey = (typeof allRollColorKeys)[number]

export const entryTypes = [
  'own',
  'enemy',
  'team',
  'target',
  'teamBuff',
  'notOwnBuff',
  'enemyDeBuff', // Ends with 'Buff' so `Calculator` can pick up on this tag
  'display', // Display-only, not participating in any buffs
] as const

export const presets = [
  'preset0',
  'preset1',
  'preset2',
  'preset3',
  'preset4',
  'preset5',
  'preset6',
  'preset7',
  'preset8',
  'preset9',
] as const

export type EntryType = (typeof entryTypes)[number]
export type Preset = (typeof presets)[number]

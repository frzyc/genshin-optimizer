import type {
  CharacterKey,
  LightConeKey,
  RelicSetKey,
} from '@genshin-optimizer/sr/consts'

export type CondKey = CharacterKey | RelicSetKey | LightConeKey
// Stored per-char loadout, so the dst is assumed to be the owning char
// CondKey is the SheetKey
// key is the condKey
// value is the condValue
export type ConditionalValues = Partial<
  Record<CondKey, { [key: string]: string }>
>

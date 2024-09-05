import type {
  CharacterKey,
  LightConeKey,
  RelicSetKey,
} from '@genshin-optimizer/sr/consts'

type SheetKey = CharacterKey | RelicSetKey | LightConeKey
// Stored per-char loadout, so the dst is assumed to be the owning char
// CharKey|'all' is the srcKey
// SheetKey is the SheetKey
// condkey is the condKey
// value is the condValue
export type ConditionalValues = Partial<
  Record<
    CharacterKey | 'all',
    Partial<Record<SheetKey, { [condkey: string]: number }>>
  >
>

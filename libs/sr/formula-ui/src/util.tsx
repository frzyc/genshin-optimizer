import type {
  CharacterGenderedKey,
  LightConeKey,
  NonTrailblazerCharacterKey,
  RelicSetKey,
  TrailblazerGenderedKey,
} from '@genshin-optimizer/sr/consts'
import type { Tag } from '@genshin-optimizer/sr/formula'
import { Translate } from '@genshin-optimizer/sr/i18n'
import type { ReactNode } from 'react'
export const st = (
  strKey: string,
  values?: Record<string, string | number>
) => <Translate ns="sheet" key18={strKey} values={values} />
export const stg = (strKey: string) => (
  <Translate ns="characters_gen" key18={strKey} />
)

type Translated = [
  trg: (i18key: string, values?: Record<string, string | number>) => ReactNode,
  tr: (i18key: string, values?: Record<string, string | number>) => ReactNode,
]

export function trans(typeKey: 'char', key: CharacterGenderedKey): Translated
export function trans(typeKey: 'lightcone', key: LightConeKey): Translated
export function trans(typeKey: 'relic', key: RelicSetKey): Translated
export function trans(
  typeKey: 'char' | 'lightcone' | 'relic',
  key:
    | NonTrailblazerCharacterKey
    | TrailblazerGenderedKey
    | LightConeKey
    | RelicSetKey
): Translated {
  return [
    (strKey: string, values?: Record<string, string | number>) => (
      <Translate ns={`${typeKey}_${key}_gen`} key18={strKey} values={values} />
    ),
    (strKey: string, values?: Record<string, string | number>) => (
      <Translate ns={`${typeKey}_${key}`} key18={strKey} values={values} />
    ),
  ]
}

export function getTagLabel(tag: Tag | undefined | null): string {
  if (!tag) return ''
  const { et, q, qt, name } = tag
  if (et === 'own' && qt === 'formula' && q !== 'base') {
    return name ?? q ?? ''
  }
  // TODO: Determine when we should return qt + q vs just q
  // e.g. for qt: 'base', q: 'atk' we would want both
  return q ?? ''
}

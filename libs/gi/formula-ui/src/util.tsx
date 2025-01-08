import type {
  ArtifactSetKey,
  CharacterSheetKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { Translate } from '@genshin-optimizer/gi/i18n'

import type { ReactNode } from 'react'
export const st = (
  strKey: string,
  values?: Record<string, string | number>
) => <Translate ns="sheet" key18={strKey} values={values} />
export const stg = (strKey: string) => (
  <Translate ns="sheet_gen" key18={strKey} />
)

type Translated = [
  trg: (i18key: string) => ReactNode,
  tr: (i18key: string, values?: Record<string, string | number>) => ReactNode
]
type CharTransKey =
  | CharacterSheetKey
  | 'TravelerM'
  | 'TravelerF'
  | 'TravelerAnemo'
  | 'TravelerGeo'
  | 'TravelerElectro'
  | 'TravelerDendro'
  | 'TravelerHydro'
  | 'TravelerPyro'
export function trans(typeKey: 'char', key: CharTransKey): Translated
export function trans(typeKey: 'weapon', key: WeaponKey): Translated
export function trans(typeKey: 'artifact', key: ArtifactSetKey): Translated
export function trans(
  typeKey: 'char' | 'weapon' | 'artifact',
  key: CharTransKey | WeaponKey | ArtifactSetKey
): Translated {
  const nogen =
    (typeKey === 'char' && key === 'Somnia') ||
    (typeKey === 'weapon' && key === 'QuantumCatalyst')
  return [
    (strKey: string) => (
      <Translate
        ns={nogen ? `${typeKey}_${key}` : `${typeKey}_${key}_gen`}
        key18={strKey}
      />
    ),
    (strKey: string, values?: Record<string, string | number>) => (
      <Translate ns={`${typeKey}_${key}`} key18={strKey} values={values} />
    ),
  ]
}

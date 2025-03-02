import type { TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type {
  CharacterKey,
  DiscSetKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { Translate } from '@genshin-optimizer/zzz/i18n'
import { StatDisplay } from '@genshin-optimizer/zzz/ui'
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
  tr: (i18key: string, values?: Record<string, string | number>) => ReactNode
]

export function trans(typeKey: 'char', key: CharacterKey): Translated
export function trans(typeKey: 'wengine', key: WengineKey): Translated
export function trans(typeKey: 'disc', key: DiscSetKey): Translated
export function trans(
  typeKey: 'char' | 'wengine' | 'disc',
  key: CharacterKey | WengineKey | DiscSetKey
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
/**
 * Only works for tag that maps to a general Stat to be displayed.
 */
export function TagToTagField(tag: Tag): TagField {
  let q = tag.q
  if (q === 'dmg_' && tag.attribute) q = `${tag.attribute}_dmg_`
  return {
    title: <StatDisplay statKey={q as any} />,
    fieldRef: tag,
  }
}

import { ColorText } from '@genshin-optimizer/common/ui'
import type { TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type {
  CharacterKey,
  DiscSetKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { Translate } from '@genshin-optimizer/zzz/i18n'
import type { ReactNode } from 'react'
import { getVariant } from './char/util'
import { TagFallbackLabel } from './components/TagFallbackLabel'

export { getTagLabel } from './tagLabel'

export function st(strKey: string, values?: Record<string, string | number>) {
  return <Translate ns="sheet" key18={strKey} values={values} />
}

export function stg(strKey: string) {
  return <Translate ns="characters_gen" key18={strKey} />
}

type Translated = [
  trg: (i18key: string, values?: Record<string, string | number>) => ReactNode,
  tr: (i18key: string, values?: Record<string, string | number>) => ReactNode,
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

export function tagToTagField(tag: Tag): TagField {
  return {
    title: (
      <ColorText color={getVariant(tag)}>
        <TagFallbackLabel tag={tag} />
      </ColorText>
    ),
    fieldRef: tag,
  }
}

import type { TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type {
  CharacterKey,
  DiscSetKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import { abilityBaseName } from '@genshin-optimizer/zzz/formula'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { Translate } from '@genshin-optimizer/zzz/i18n'
import type { ReactNode } from 'react'
import { parseAbilityHitFromName } from './abilityTag'
import { abilityDisplayNameString } from './char/abilityFormulaLabels'
import { TagFieldTitle } from './TagFieldTitle'

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

const formulaBaseQs = new Set([
  'standardDmgBase',
  'sheerDmgBase',
  'anomalyDmgBase',
  'shieldBase',
  'dazeBuildupBase',
  'anomBuildupBase',
  'healBase',
])

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

export function getTagLabel(tag: Tag | undefined | null): string {
  if (!tag) return ''
  const { et, q, qt, name } = tag
  if (et === 'own' && qt === 'formula' && q && formulaBaseQs.has(q))
    return 'base'
  if (et === 'own' && qt === 'formula' && q !== 'base') {
    if (name && tag.sheet && allCharacterKeys.includes(tag.sheet as CharacterKey)) {
      const display = abilityDisplayNameString(tag.sheet as CharacterKey, tag)
      if (display) return display
    }
    if (name) {
      return parseAbilityHitFromName(abilityBaseName(name)).abilityKey
    }
    return q ?? ''
  }
  return q ?? ''
}

export function tagToTagField(
  tag: Tag,
  opts?: { preventRecursion?: boolean }
): TagField {
  return {
    title: (
      <TagFieldTitle tag={tag} preventRecursion={opts?.preventRecursion} />
    ),
    fieldRef: tag,
  }
}

import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import {
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { useCallback, useMemo } from 'react'
import type { TalentSheetElementKey } from '../char/consts'

export const optPanelSectionKeys = ['stats', 'other'] as const
export type OptPanelSectionKey = (typeof optPanelSectionKeys)[number]
export type OptFieldSectionKey = TalentSheetElementKey | OptPanelSectionKey

/** Collapsed opt field sections for the current character, persisted in charMeta. */
export function useOptCategoryCollapse() {
  const character = useCharacterContext()
  const { database } = useDatabaseContext()
  const charMetaFromDb = useDataManagerBase(
    database.charMeta,
    (character?.key ?? '') as CharacterKey
  )
  const charMeta = character
    ? (charMetaFromDb ?? database.charMeta.get(character.key))
    : undefined

  const collapsedSet = useMemo(
    () => new Set(charMeta?.collapsedOptCategories ?? []),
    [charMeta?.collapsedOptCategories]
  )

  const isCollapsed = useCallback(
    (section: OptFieldSectionKey) => collapsedSet.has(section),
    [collapsedSet]
  )

  const toggleCollapsed = useCallback(
    (section: OptFieldSectionKey) => {
      if (!character || !charMeta) return
      const current = charMeta.collapsedOptCategories
      const next = collapsedSet.has(section)
        ? current.filter((c) => c !== section)
        : [...current, section]
      database.charMeta.set(character.key, { collapsedOptCategories: next })
    },
    [charMeta, character, collapsedSet, database.charMeta]
  )

  return useMemo(() => {
    if (!character || !charMeta) return null
    return { isCollapsed, toggleCollapsed }
  }, [character, charMeta, isCollapsed, toggleCollapsed])
}

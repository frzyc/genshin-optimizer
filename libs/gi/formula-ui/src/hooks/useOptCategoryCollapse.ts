import {
  CharacterContext,
  useDatabase,
  usePandoTeam,
} from '@genshin-optimizer/gi/db-ui'
import { useCallback, useContext, useMemo } from 'react'
import type { TalentSheetElementKey } from '../char/consts'

export const optPanelSectionKeys = ['stats', 'other'] as const
export type OptPanelSectionKey = (typeof optPanelSectionKeys)[number]
export type OptFieldSectionKey = TalentSheetElementKey | OptPanelSectionKey

/** Collapsed opt field sections for the current character, persisted in pandoTeam. */
export function useOptCategoryCollapse() {
  const { character } = useContext(CharacterContext)
  const database = useDatabase()
  const pandoTeam = usePandoTeam(character.key)

  const collapsedSet = useMemo(
    () => new Set(pandoTeam?.collapsedOptCategories ?? []),
    [pandoTeam?.collapsedOptCategories]
  )

  const isCollapsed = useCallback(
    (section: OptFieldSectionKey) => collapsedSet.has(section),
    [collapsedSet]
  )

  const toggleCollapsed = useCallback(
    (section: OptFieldSectionKey) => {
      if (!character || !pandoTeam) return
      const current = pandoTeam.collapsedOptCategories
      const next = collapsedSet.has(section)
        ? current.filter((c) => c !== section)
        : [...current, section]
      database.pandoTeams.set(character.key, {
        collapsedOptCategories: next,
      })
    },
    [character, collapsedSet, database.pandoTeams, pandoTeam]
  )

  return useMemo(() => {
    if (!character || !pandoTeam) return null
    return { isCollapsed, toggleCollapsed }
  }, [character, isCollapsed, pandoTeam, toggleCollapsed])
}

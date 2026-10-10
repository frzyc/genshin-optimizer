import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { PandoTeam } from '@genshin-optimizer/gi/db'
import { useContext } from 'react'
import { CharacterContext } from '../contexts/CharacterContext'
import { useDatabase } from './useDatabase'

export function usePandoTeam(characterKey: CharacterKey) {
  const database = useDatabase()
  return useDataManagerBase(database.pandoTeams, characterKey)
}

/** Pando team for the character currently in `CharacterContext`. */
export function useRequiredPandoTeam(): PandoTeam {
  const { character } = useContext(CharacterContext)
  const team = usePandoTeam(character.key)
  if (!team) throw new Error(`Missing PandoTeam for ${character.key}`)
  return team
}

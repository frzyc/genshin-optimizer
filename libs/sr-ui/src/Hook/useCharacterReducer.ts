import type { CharacterKey } from '@genshin-optimizer/sr-consts'
import type { ICachedSroCharacter } from '@genshin-optimizer/sr-db'
import { useCallback } from 'react'
import { useDatabaseContext } from '../Context'

type characterTeamAction = {
  type: 'team'
  index: number
  charKey: CharacterKey | ''
}
export type characterReducerAction =
  | characterTeamAction
  | Partial<ICachedSroCharacter>

export function useCharacterReducer(characterKey: CharacterKey | '') {
  const { database } = useDatabaseContext()

  return useCallback(
    (action: characterReducerAction): void => {
      if (!characterKey) return
      const character = database.chars.get(characterKey)
      if (!character) return
      if ('type' in action)
        switch (action.type) {
          case 'team': {
            const { team: team_ } = character
            const team = [...team_] as ICachedSroCharacter['team']
            const { index, charKey } = action
            team[index] = charKey
            // update src character
            database.chars.set(characterKey, { ...character, team })
          }
        }
      else database.chars.set(characterKey, { ...character, ...action })
    },
    [characterKey, database]
  )
}

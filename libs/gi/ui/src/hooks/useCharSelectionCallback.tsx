import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Basically a history hook to go to the dedicated character page. Will create the character if it doesn't exist.
 * @returns
 */
export function useCharSelectionCallback() {
  const database = useDatabase()
  const navigate = useNavigate()

  const cb = useCallback(
    (characterKey: CharacterKey) => {
      const character = database.chars.get(characterKey)
      // Create a new character + weapon, with linking if char isnt in db.
      if (!character) {
        database.chars.getWithInitWeapon(characterKey)
      }
      navigate(`/characters/${characterKey}`)
    },
    [navigate, database],
  )
  return cb
}

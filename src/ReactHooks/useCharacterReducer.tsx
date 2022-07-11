import { useCallback, useContext } from "react";
import { DatabaseContext } from "../Database/Database";
import { ICachedCharacter } from "../Types/character";
import { CharacterKey } from "../Types/consts";
import { deepClone } from "../Util/Util";

type characterReducerBonusStatsAction = {
  type: "editStats",
  statKey: string
  value: any | undefined
}
type characterReducerenemyOverrideAction = {
  type: "enemyOverride",
  statKey: string
  value: any | undefined
}
type characterReducerResetStatsAction = {
  type: "resetStats",
  statKey: string
}
type characterTeamAction = {
  type: "team",
  index: number,
  charKey: CharacterKey | ""
}
export type characterReducerAction = characterReducerBonusStatsAction | characterReducerenemyOverrideAction | characterReducerResetStatsAction | characterTeamAction | Partial<ICachedCharacter>

export default function useCharacterReducer(characterKey: CharacterKey | "") {
  const { database } = useContext(DatabaseContext)

  return useCallback((action: characterReducerAction): void => {
    if (!characterKey) return

    if ("type" in action) switch (action.type) {
      case "enemyOverride": {
        const character = database.chars.get(characterKey)!
        const enemyOverride = character.enemyOverride
        const { statKey, value } = action
        if (enemyOverride[statKey] === value) break
        database.chars.set(characterKey, { ...character, enemyOverride: { ...enemyOverride, [statKey]: value } })
        break
      }
      case "editStats": {
        const character = database.chars.get(characterKey)!
        const { statKey, value } = action

        const bonusStats = deepClone(character.bonusStats)

        if (bonusStats[statKey] === value) break
        if (!value) delete bonusStats[statKey]
        else bonusStats[statKey] = value

        database.chars.set(characterKey, { ...character, bonusStats })
        break
      }
      case "resetStats": {
        const character = database.chars.get(characterKey)!
        const { statKey } = action

        const bonusStats = character.bonusStats
        delete bonusStats[statKey]

        database.chars.set(characterKey, { ...character, bonusStats })
        break
      }
      case "team": {
        const character = database.chars.get(characterKey)!
        const { team: team_ } = character
        const team = [...team_] as ICachedCharacter["team"]

        const { index, charKey: newCharKey } = action
        const oldCharKey = team[index]
        team[index] = newCharKey

        // move the old char to "inventory"
        if (oldCharKey) {
          const oldChar = database.chars.get(oldCharKey)
          if (oldChar) database.chars.set(oldCharKey, { ...oldChar, team: ["", "", ""] })
        }

        // unequip new char from its old teammates
        if (newCharKey) {
          const newChar = database.chars.get(newCharKey)
          if (newChar) {
            newChar.team.forEach(t => {
              if (!t) return
              const tChar = database.chars.get(t)
              tChar && database.chars.set(t, { ...tChar, team: tChar.team.map(c => c === newCharKey ? "" : c) as ICachedCharacter["team"] })
            })
          }
        }

        // equip new char to new teammates
        team.forEach((t, tind) => {
          if (!t) return
          const newChar = database.chars.get(t)
          if (newChar) database.chars.set(t, { ...newChar, team: [characterKey, ...team].filter((_, i) => i !== tind + 1) as ICachedCharacter["team"] })
        })

        // update src character
        database.chars.set(characterKey, { ...character, team })
      }
    } else
      database.chars.set(characterKey, { ...database.chars.get(characterKey)!, ...action })
  }, [characterKey, database])

}

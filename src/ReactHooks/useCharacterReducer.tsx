import { useCallback, useContext } from "react";
import { DatabaseContext } from "../Database/Database";
import { ICachedCharacter } from "../Types/character";
import { CharacterKey } from "../Types/consts";
import { characterBaseStats, overrideStatKeys } from "../Util/StatUtil";

type characterEquipWeapon = {
  type: "weapon", id: string
}
type characterReducerBonusStatsAction = {
  type: "editStats",
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
export type characterReducerAction = characterEquipWeapon | characterReducerBonusStatsAction | characterReducerResetStatsAction | characterTeamAction | Partial<ICachedCharacter>

export default function useCharacterReducer(characterKey: CharacterKey | "") {
  const database = useContext(DatabaseContext)

  return useCallback((action: characterReducerAction): void => {
    if (!characterKey) return

    if ("type" in action) switch (action.type) {
      case "weapon":
        database.setWeaponLocation(action.id, characterKey)
        break
      case "editStats": {
        const character = database._getChar(characterKey)!
        const { statKey, value } = action

        const bonusStats = character.bonusStats

        if (bonusStats[statKey] === value) return
        if (overrideStatKeys.includes(statKey)) {
          if ((characterBaseStats(character)[statKey] ?? 0) === value)
            delete bonusStats[statKey]
          else
            bonusStats[statKey] = value
        } else {
          if (value)
            bonusStats[statKey] = value
          else
            delete bonusStats[statKey]
        }
        database.updateChar({ ...character, bonusStats })
        break
      }
      case "resetStats": {
        const character = database._getChar(characterKey)!
        const { statKey } = action

        const bonusStats = character.bonusStats
        delete bonusStats[statKey]

        database.updateChar({ ...character, bonusStats })
        break
      }
      case "team": {
        const character = database._getChar(characterKey)!
        const { team } = character

        const { index, charKey: newCharKey } = action
        const oldCharKey = team[index]
        team[index] = newCharKey

        // move the old char to "inventory"
        if (oldCharKey) {
          const oldChar = database._getChar(oldCharKey)
          if (oldChar) database.updateChar({ ...oldChar, team: ["", "", ""] })
        }

        // unequip new char from its old teammates
        if (newCharKey) {
          const newChar = database._getChar(newCharKey)
          if (newChar) {
            newChar.team.forEach(t => {
              if (!t) return
              const tChar = database._getChar(t)
              tChar && database.updateChar({ ...tChar, team: tChar.team.map(c => c === newCharKey ? "" : c) as ICachedCharacter["team"] })
            })
          }
        }

        // equip new char to new teammates
        team.forEach((t, tind) => {
          if (!t) return
          const newChar = database._getChar(t)
          if (newChar) database.updateChar({ ...newChar, team: [characterKey, ...team].filter((_, i) => i !== tind + 1) as ICachedCharacter["team"] })
        })

        // update src character
        database.updateChar({ ...character, team })
      }
    } else
      database.updateChar({ ...database._getChar(characterKey)!, ...action })
  }, [characterKey, database])

}
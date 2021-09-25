import { useCallback, useContext } from "react";
import { DatabaseContext } from "../Database/Database";
import { ICachedCharacter } from "../Types/character";
import { CharacterKey } from "../Types/consts";
import { characterBaseStats } from "../Util/StatUtil";

type characterEquipWeapon = {
  type: "weapon", id: string
}
type characterReducerBonusStatsAction = {
  type: "bonusStats",
  statKey: string
  value: any | undefined
}
export type characterReducerAction = characterEquipWeapon | characterReducerBonusStatsAction | Partial<ICachedCharacter>

export default function useCharacterReducer(characterKey: CharacterKey) {
  const database = useContext(DatabaseContext)

  return useCallback((action: characterReducerAction): void => {
    if (!characterKey) return

    if ("type" in action) switch (action.type) {
      case "weapon":
        database.setWeaponLocation(action.id, characterKey)
        break
      case "bonusStats": {
        const character = database._getChar(characterKey)!
        const { statKey, value } = action
        const bonusStats = character.bonusStats
        if (bonusStats[statKey] === value) return

        bonusStats[statKey] = value
        if ((characterBaseStats(character)[statKey] ?? 0) === value)
          delete bonusStats[statKey]

        database.updateChar({ ...character, bonusStats })
        break
      }
    } else
      database.updateChar({ ...database._getChar(characterKey)!, ...action })
  }, [characterKey, database])

}
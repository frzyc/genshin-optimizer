import { useCallback, useContext } from "react";
import { DatabaseContext } from "../Database/Database";
import { ICachedCharacter } from "../Types/character";
import { CharacterKey } from "../Types/consts";
import { characterBaseStats, overrideStatKeys } from "../Util/StatUtil";

type characterEquipWeapon = {
  type: "weapon", id: string
}
type characterReducerBonusStatsAction = {
  type: "bonusStats",
  statKey: string
  value: any | undefined
}
export type characterReducerAction = characterEquipWeapon | characterReducerBonusStatsAction | Partial<ICachedCharacter>

export default function useCharacterReducer(characterKey:CharacterKey){
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
        if (!value || (overrideStatKeys.includes(statKey) && characterBaseStats(character)[statKey] === value)) {
          delete bonusStats[statKey]
        } else bonusStats[statKey] = value
        database.updateChar({ ...character, bonusStats })
        break
      }
    } else
      database.updateChar({ ...database._getChar(characterKey)!, ...action })
  }, [characterKey, database])

}
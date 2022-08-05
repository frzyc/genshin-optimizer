import { useCallback, useContext } from "react";
import { DatabaseContext } from "../Database/Database";
import { ICachedCharacter } from "../Types/character";
import { CharacterKey } from "../Types/consts";
import { IConditionalValues } from "../Types/sheet";
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
type characterTeamConditional = {
  type: "teamConditional",
  teamMateKey: CharacterKey,
  conditional: IConditionalValues
}
export type characterReducerAction = characterReducerBonusStatsAction | characterReducerenemyOverrideAction | characterReducerResetStatsAction | characterTeamAction | characterTeamConditional | Partial<ICachedCharacter>

export default function useCharacterReducer(characterKey: CharacterKey | "") {

  const { database } = useContext(DatabaseContext)

  return useCallback((action: characterReducerAction): void => {
    if (!characterKey) return
    const character = database.chars.get(characterKey)
    if (!character) return
    if ("type" in action) switch (action.type) {
      case "enemyOverride": {
        const enemyOverride = character.enemyOverride
        const { statKey, value } = action
        if (enemyOverride[statKey] === value) break
        database.chars.set(characterKey, { ...character, enemyOverride: { ...enemyOverride, [statKey]: value } })
        break
      }
      case "editStats": {
        const { statKey, value } = action
        const bonusStats = deepClone(character.bonusStats)
        if (bonusStats[statKey] === value) break
        if (!value) delete bonusStats[statKey]
        else bonusStats[statKey] = value
        database.chars.set(characterKey, { ...character, bonusStats })
        break
      }
      case "resetStats": {
        const { statKey } = action
        const bonusStats = character.bonusStats
        delete bonusStats[statKey]
        database.chars.set(characterKey, { ...character, bonusStats })
        break
      }
      case "teamConditional": {
        const { teamMateKey, conditional } = action
        const teamConditional = deepClone(character.teamConditional)
        teamConditional[teamMateKey] = conditional
        database.chars.set(characterKey, { ...character, teamConditional })
        break
      }
      case "team": {
        const { team: team_ } = character
        const team = [...team_] as ICachedCharacter["team"]
        const { index, charKey } = action
        team[index] = charKey
        // update src character
        database.chars.set(characterKey, { ...character, team })
      }
    } else
      database.chars.set(characterKey, { ...character, ...action })
  }, [characterKey, database])
}

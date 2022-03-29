import { initialBuildSettings } from "../PageBuild/BuildSetting"
import { ICachedCharacter } from "../Types/character"
import { allSlotKeys, CharacterKey } from "../Types/consts"
import { objectKeyMap } from "./Util"

export function initialCharacter(key: CharacterKey): ICachedCharacter {
  return {
    key, // the game character this is based off
    level: 1,
    ascension: 0,
    hitMode: "avgHit",
    reactionMode: "",
    equippedArtifacts: objectKeyMap(allSlotKeys, () => ""),
    equippedWeapon: "",
    conditional: {},
    bonusStats: {},
    enemyOverride: {},
    buildSettings: initialBuildSettings(),
    talent: {
      auto: 1,
      skill: 1,
      burst: 1,
    },
    infusionAura: "",
    constellation: 0,
    team: ["", "", ""],
    compareData: false,
  }
}

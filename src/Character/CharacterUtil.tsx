import { initialBuildSettings } from "../Build/BuildSetting"
import SqBadge from "../Components/SqBadge"
import { Sheets } from "../ReactHooks/useSheets"
import { ICachedCharacter, TalentSheetElementKey } from "../Types/character"
import { allSlotKeys, CharacterKey } from "../Types/consts"
import { ICalculatedStats } from "../Types/stats"
import { objectFromKeyMap } from "../Util/Util"

export function getFormulaTargetsDisplayHeading(key: string, sheets: Sheets, build: ICalculatedStats): {
  title: Displayable,
  icon?: string
} {
  if (key === "basicKeys") return {
    title: "Basic Stats"
  }
  else if (key === "genericAvgHit") return {
    title: "Generic Optimization Values"
  }
  else if (key === "transReactions") return {
    title: "Transformation Reaction"
  }
  else if (key.startsWith("talentKey_")) {
    const subkey = key.split("talentKey_")[1]
    const talent = sheets.characterSheets[build.characterKey].getTalentOfKey(subkey as TalentSheetElementKey, build.characterEle)
    return {
      icon: talent?.img,
      title: talent?.name ?? subkey
    }
  } else if (key.startsWith("weapon_")) {
    const subkey = key.split("weapon_")[1]
    const sheet = sheets.weaponSheets[build.weapon.key]
    return {
      icon: build.weapon.refineIndex < 2 ? sheet?.img : sheet?.imgAwaken,
      title: (sheet.name ?? subkey)
    }
  } else if (key.startsWith("artifact_")) {
    const [, setKey, num] = key.split('_')
    const sheet = sheets.artifactSheets[setKey]
    return {
      icon: sheet.defIconSrc,
      title: <span>{sheet.name} <SqBadge color="success">{num}-Set</SqBadge></span>
    }
  }
  return {
    title: ""
  }
}

export function initialCharacter(key: CharacterKey): ICachedCharacter {
  return {
    key, // the game character this is based off
    level: 1,
    ascension: 0,
    hitMode: "avgHit",
    reactionMode: "",
    equippedArtifacts: objectFromKeyMap(allSlotKeys, () => ""),
    equippedWeapon: "",
    conditionalValues: {},
    bonusStats: {},
    buildSettings: initialBuildSettings(),
    talent: {
      auto: 1,
      skill: 1,
      burst: 1,
    },
    infusionAura: "",
    constellation: 0,
    team: ["", "", ""]
  }
}
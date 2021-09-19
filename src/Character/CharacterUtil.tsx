import { Badge } from "react-bootstrap"
import { ArtifactSheet } from "../Artifact/ArtifactSheet"
import { initialBuildSettings } from "../Build/BuildSetting"
import { ICachedCharacter } from "../Types/character"
import { allSlotKeys, ArtifactSetKey, CharacterKey, ElementKey } from "../Types/consts"
import { objectFromKeyMap } from "../Util/Util"
import WeaponSheet from "../Weapon/WeaponSheet"
import CharacterSheet from "./CharacterSheet"

export function getFormulaTargetsDisplayHeading(key: string, { characterSheet, weaponSheet, artifactSheets }: { characterSheet: CharacterSheet, weaponSheet: WeaponSheet, artifactSheets: StrictDict<ArtifactSetKey, ArtifactSheet> }, eleKey: ElementKey = "anemo") {
  if (key === "basicKeys") return "Basic Stats"
  else if (key === "genericAvgHit") return "Generic Optimization Values"
  else if (key === "transReactions") return "Transformation Reaction"
  else if (key.startsWith("talentKey_")) {
    const subkey = key.split("talentKey_")[1]
    return (characterSheet?.getTalentOfKey(subkey, eleKey)?.name ?? subkey)
  } else if (key.startsWith("weapon_")) {
    const subkey = key.split("weapon_")[1]
    return (weaponSheet?.name ?? subkey)
  } else if (key.startsWith("artifact_")) {
    const [, setKey, num] = key.split('_')
    return <span>{artifactSheets[setKey]?.name} <Badge variant="success">{num}-Set</Badge></span>
  }
  return ""
}

export function initialCharacter(key: CharacterKey): ICachedCharacter {
  return {
    key, // the game character this is based off
    level: 1,
    ascension: 0,
    hitMode: "avgHit",
    reactionMode: null,
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
  }
}
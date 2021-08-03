import { Badge } from "react-bootstrap"
import { ArtifactSheet } from "../Artifact/ArtifactSheet"
import { ArtifactSetKey, ElementKey } from "../Types/consts"
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
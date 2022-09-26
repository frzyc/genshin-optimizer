import { input } from ".";
import ColorText from "../Components/ColoredText";
import { ArtifactSheet } from "../Data/Artifacts/ArtifactSheet";
import CharacterSheet from "../Data/Characters/CharacterSheet";
import WeaponSheet from "../Data/Weapons/WeaponSheet";
import { ArtCharDatabase } from "../Database/Database";
import { ArtifactSetKey, CharacterKey, WeaponKey } from "../Types/consts";
import { range } from "../Util/Util";
import { DisplaySub } from "./type";
import { NodeDisplay, UIData } from "./uiData";

const errHeader = {
  title: <ColorText color="warning">ERROR</ColorText>
}

const talentMap = {
  normal: "Normal Atk.",
  charged: "Charged Atk.",
  plunging: "Plunging Atk.",
  skill: "Ele. Skill",
  burst: "Ele. Burst",
  passive: "Passive",
  passive1: "1st Asc. Pass.",
  passive2: "4th Asc. Pass.",
  passive3: "Util. Pass.",
  ...Object.fromEntries(range(1, 6).map(i => [`constellation${i}`, `Const. ${i}`]))
}
export async function getDisplayHeader(data: UIData, sectionKey: string, database: ArtCharDatabase): Promise<{
  title: Displayable,
  icon?: string,
  action?: Displayable
}> {
  if (!sectionKey) return errHeader
  if (sectionKey === "basic") return { title: "Basic Stats" }
  if (sectionKey === "custom") return { title: "Custom Multi Target" }
  else if (sectionKey === "reaction") return { title: "Transformative Reactions" }
  else if (sectionKey.includes(":")) {
    const [namespace, key] = sectionKey.split(":")
    if (namespace === "artifact") {
      const sheet = await ArtifactSheet.get(key as ArtifactSetKey)
      if (!sheet) return errHeader
      return {
        title: sheet.name,
        icon: sheet.defIconSrc
      }
    } else if (namespace === "weapon") {
      const sheet = await WeaponSheet.get(key as WeaponKey)
      if (!sheet) return errHeader
      const asc = data.get(input.weapon.asc).value
      return {
        title: sheet.name,
        icon: sheet.getImg(asc)
      }
    }
  } else {
    const cKey = data.get(input.charKey).value
    if (!cKey) return errHeader
    const sheet = await CharacterSheet.get(cKey as CharacterKey, database.gender)
    const talentKey = ["normal", "charged", "plunging"].includes(sectionKey) ? "auto" : sectionKey
    const talent = sheet?.getTalentOfKey(talentKey as any)
    if (!talent) return errHeader
    const actionText = talentMap[sectionKey]
    return {
      icon: talent.img,
      title: talent.name,
      action: actionText
    }
  }
  return errHeader
}
/**
 * Use this function to reorganize the sections to have basic stats, custom at the beginning, and reaction at the end.
 * @param data
 * @returns
 */
export function getDisplaySections(data: UIData): [string, DisplaySub<NodeDisplay>][] {
  const display = data.getDisplay()
  const sections = Object.entries(display)
  const basic = sections.filter(([k]) => k === "basic")
  const reaction = sections.filter(([k]) => k === "reaction")
  const custom = sections.filter(([k]) => k === "custom")
  const weapon = sections.filter(([k]) => k.startsWith("weapon"))
  const artifact = sections.filter(([k]) => k.startsWith("artifact"))
  const rest = sections.filter(([k]) => k !== "basic" && k !== "reaction" && !k.startsWith("weapon") && !k.startsWith("artifact") && k !== "custom")

  return [
    ...basic,
    ...reaction,
    ...custom,
    ...rest,
    ...weapon,
    ...artifact,
  ]
}

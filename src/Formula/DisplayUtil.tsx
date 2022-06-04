import { Typography } from "@mui/material";
import { input } from ".";
import { ArtifactSheet } from "../Data/Artifacts/ArtifactSheet";
import CharacterSheet from "../Data/Characters/CharacterSheet";
import ColorText from "../Components/ColoredText";
import SqBadge from "../Components/SqBadge";
import { ArtifactSetKey, CharacterKey, ElementKey, WeaponKey } from "../Types/consts";
import { range } from "../Util/Util";
import WeaponSheet from "../Data/Weapons/WeaponSheet";
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
export async function getDisplayHeader(data: UIData, sectionKey: string): Promise<{
  title: Displayable,
  icon?: string,
  action?: Displayable
}> {
  if (!sectionKey) return errHeader
  if (sectionKey === "basic") return { title: "Basic Stats" }
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
        icon: asc < 2 ? sheet.img : sheet.imgAwaken
      }
    }
  } else {
    const cKey = data.get(input.charKey).value
    const cEle = data.get(input.charEle).value
    if (!cKey || !cEle) return errHeader
    const sheet = await CharacterSheet.get(cKey as CharacterKey)
    const talentKey = ["normal", "charged", "plunging"].includes(sectionKey) ? "auto" : sectionKey
    const talent = sheet?.getTalentOfKey(talentKey as any, cEle as ElementKey)
    if (!talent) return errHeader
    const actionText = talentMap[sectionKey]
    return {
      icon: talent.img,
      title: talent.name,
      action: actionText ? <SqBadge ><Typography variant="subtitle2">{actionText}</Typography></SqBadge> : undefined
    }
  }
  return errHeader
}
/**
 * Use this function to reorganize the sections to have basic stats at the beginning, and reation at the end.
 * @param data
 * @returns
 */
export function getDisplaySections(data: UIData,): [string, DisplaySub<NodeDisplay>][] {
  const display = data.getDisplay()
  const sections = Object.entries(display).filter(([key, nodes]) => !Object.values(nodes).every(x => x.isEmpty))
  const basic = sections.filter(([k]) => k === "basic")
  const reaction = sections.filter(([k]) => k === "reaction")
  const weapon = sections.filter(([k]) => k.startsWith("weapon"))
  const artifact = sections.filter(([k]) => k.startsWith("artifact"))
  const rest = sections.filter(([k]) => k !== "basic" && k !== "reaction" && !k.startsWith("weapon") && !k.startsWith("artifact"))

  return [
    ...basic,
    ...rest,
    ...weapon,
    ...artifact,
    ...reaction
  ]
}

import { characterAsset } from "@genshin-optimizer/g-assets";
import Assets from "../../Assets/Assets";
import ImgIcon from "../../Components/Image/ImgIcon";
import SqBadge from "../../Components/SqBadge";
import { input } from "../../Formula";
import { NumNode } from "../../Formula/type";
import { greaterEq } from "../../Formula/utils";
import { CharacterKey, CharacterSheetKey, travelerFKeys, travelerMKeys, WeaponTypeKey } from "../../Types/consts";
import { DocumentConditional, DocumentConditionalBase, DocumentSection, IDocumentFields, IDocumentHeader } from "../../Types/sheet";
import { st, trans } from "../SheetUtil";
import { TalentSheetElement, TalentSheetElementKey } from "./ICharacterSheet.d";

const canShowTalentsNodes: Partial<Record<TalentSheetElementKey, NumNode>> = {
  "passive1": greaterEq(input.asc, 1, 1),
  "passive2": greaterEq(input.asc, 4, 1),
  "constellation1": greaterEq(input.constellation, 1, 1),
  "constellation2": greaterEq(input.constellation, 2, 1),
  "constellation3": greaterEq(input.constellation, 3, 1),
  "constellation4": greaterEq(input.constellation, 4, 1),
  "constellation5": greaterEq(input.constellation, 5, 1),
  "constellation6": greaterEq(input.constellation, 6, 1),
}


export interface ICharacterTemplate {
  chg: (i18key: string) => Displayable,
  ch: (i18key: string) => Displayable,
  talentTem: (talentKey: TalentSheetElementKey, docSections?: DocumentSection[]) => TalentSheetElement
  headerTem: (talentKey: TalentSheetElementKey, partialSection: DocumentSection) => DocumentSection
  fieldsTem: (talentKey: TalentSheetElementKey, partialFields: IDocumentFields) => IDocumentFields
  condTem: (talentKey: TalentSheetElementKey, partialCond: DocumentConditionalBase) => DocumentConditional
}
export const charTemplates = (cKey: CharacterSheetKey, wKey: WeaponTypeKey): ICharacterTemplate => {
  const [chg, ch] = trans("char", cKey)

  const img = (tk: TalentSheetElementKey): string => {
    if (tk === "auto") return Assets.weaponTypes[wKey]
    return characterAsset(charSheetKeyToCharKey(cKey), tk, "F")// Should be all genderless assets
  }

  return {
    chg,
    ch,
    talentTem: (talentKey: TalentSheetElementKey, docSections?: DocumentSection[]) => talentTemplate(talentKey, chg, img(talentKey), docSections),
    headerTem: (talentKey: TalentSheetElementKey, partialSection: DocumentSection) => headerTemplate(talentKey, chg, img(talentKey), partialSection),
    fieldsTem: (talentKey: TalentSheetElementKey, partialFields: IDocumentFields) => fieldsTemplate(talentKey, partialFields),
    condTem: (talentKey: TalentSheetElementKey, partialCond: DocumentConditionalBase) => conditionalTemplate(talentKey, partialCond, chg, img(talentKey))
  }
}

const talentTemplate = (talentKey: TalentSheetElementKey, tr: (string) => Displayable, img: string, docSections?: DocumentSection[]): TalentSheetElement => ({
  name: tr(`${talentKey}.name`),
  img,
  sections: [
    ...(talentKey !== "auto" ? [{ text: tr(`${talentKey}.description`) }] : []),
    ...(docSections || []),
  ],
})

const talentHeader = (talentKey: TalentSheetElementKey, tr: (string) => Displayable, img: string): IDocumentHeader => {
  return {
    title: tr(`${talentKey}.name`),
    icon: <ImgIcon size={2} src={img} />,
    action: <SqBadge color="success">{st(`talents.${talentKey}`)}</SqBadge>,
    description: tr(`${talentKey}.description`),
  }
}

function charSheetKeyToCharKey(csk: CharacterSheetKey): CharacterKey {
  if (travelerFKeys.includes(csk as typeof travelerFKeys[number]) || travelerMKeys.includes(csk as typeof travelerMKeys[number]))
    return csk.slice(0, -1) as CharacterKey
  else return csk as CharacterKey
}

const headerTemplate = (talentKey: TalentSheetElementKey, tr: (string) => Displayable, img: string, partialSection: DocumentSection): DocumentSection => ({
  ...partialSection,
  header: talentHeader(talentKey, tr, img),
  canShow: canShowTemplate(talentKey, partialSection.canShow),
})

const fieldsTemplate = (talentKey: TalentSheetElementKey, partialFields: IDocumentFields): IDocumentFields => ({
  ...partialFields,
  canShow: canShowTemplate(talentKey, partialFields.canShow),
})

const conditionalTemplate = (talentKey: TalentSheetElementKey, partialCond: DocumentConditionalBase, tr: (string) => Displayable, img: string): DocumentConditional => ({
  ...partialCond,
  header: { ...talentHeader(talentKey, tr, img), ...partialCond.header },
  canShow: canShowTemplate(talentKey, partialCond.canShow),
})
function canShowTemplate(talentKey: TalentSheetElementKey, canShow: NumNode | undefined): NumNode | undefined {
  if (!canShowTalentsNodes[talentKey]) {
    return canShow
  }
  let compareVal
  let val
  if (["passive1", "passive2"].includes(talentKey)) {
    compareVal = input.asc
    val = +talentKey.slice(-1) === 1 ? 1 : 4
  } else {
    compareVal = input.constellation
    val = +talentKey.slice(-1)
  }
  // Try to reuse the base canShow node when possible for caching performance
  return canShow
    ? greaterEq(compareVal, val, canShow ? canShow : 1)
    : canShowTalentsNodes[talentKey]
}

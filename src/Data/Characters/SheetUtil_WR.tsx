import Assets from "../../Assets/Assets";
import ImgIcon from "../../Components/Image/ImgIcon";
import SqBadge from "../../Components/SqBadge";
import { Translate } from "../../Components/Translate";
import { TalentSheetElement, TalentSheetElementKey } from "../../Types/character_WR";
import { WeaponTypeKey } from "../../Types/consts";
import IConditional from "../../Types/IConditional_WR";
export const st = (strKey: string) => <Translate ns="sheet" key18={strKey} />
export const sgt = (strKey: string) => <Translate ns="sheet_gen" key18={strKey} />

export const talentTemplate = (talentKey: TalentSheetElementKey, tr: (string) => Displayable, img: string): TalentSheetElement => ({
  name: tr(`${talentKey}.name`),
  img,
  sections: [{
    text: tr(`${talentKey}.description`),
  }],
})

const talentStrMap: Record<TalentSheetElementKey, string> = {
  auto: "Auto",
  skill: "Skill",
  burst: "Burst",
  passive: "Passive",
  passive1: "Ascension 1",
  passive2: "Ascension 4",
  passive3: "Passive",
  sprint: "Sprint",
  constellation1: "C1",
  constellation2: "C2",
  constellation3: "C3",
  constellation4: "C4",
  constellation5: "C5",
  constellation6: "C6"
}
export const conditionalHeader = (talentKey: TalentSheetElementKey, tr: (string) => Displayable, img: string): IConditional["header"] => {
  return {
    title: tr(`${talentKey}.name`),
    icon: <ImgIcon size={2} sx={{ m: -1 }} src={img} />,
    action: <SqBadge color="success">{talentStrMap[talentKey]}</SqBadge>,
  }
}

export const normalSrc = (weaponKey: WeaponTypeKey) => Assets.weaponTypes[weaponKey]

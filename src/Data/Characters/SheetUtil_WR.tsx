import Assets from "../../Assets/Assets";
import { getTalentStatKeyVariant } from "../../Build/Build";
import ImgIcon from "../../Components/Image/ImgIcon";
import SqBadge from "../../Components/SqBadge";
import { Translate } from "../../Components/Translate";
import { input } from "../../Formula/index";
import { DocumentSection, TalentSheetElement, TalentSheetElementKey } from "../../Types/character_WR";
import { ElementKey, WeaponTypeKey } from "../../Types/consts";
import IConditional from "../../Types/IConditional_WR";
export const st = (strKey: string) => <Translate ns="sheet" key18={strKey} />
export const sgt = (strKey: string) => <Translate ns="sheet_gen" key18={strKey} />

export const chargedDocSection = (tr, stamina = 25): DocumentSection => ({
  text: tr(`auto.fields.charged`),
  fields: [{
    text: sgt(`charged.dmg`),
    node: input.display.charged.dmg,
    variant: stats => getTalentStatKeyVariant("charged", stats),
  }, {
    text: sgt("charged.stamina"),
    value: stamina,
  }]
})
export const plungeDocSection = (tr): DocumentSection => ({
  text: tr`auto.fields.plunging`,
  fields: [{
    text: sgt(`plunging.dmg`),
    node: input.display.plunging.dmg,
    variant: stats => getTalentStatKeyVariant("plunging", stats),
  }, {
    text: sgt("plunging.low"),
    node: input.display.plunging.low,
    variant: stats => getTalentStatKeyVariant("plunging", stats),
  }, {
    text: sgt("plunging.high"),
    node: input.display.plunging.high,
    variant: stats => getTalentStatKeyVariant("plunging", stats),
  }]
})

export const claymoreChargedDocSection = (tr, data): DocumentSection => ({
  text: tr("auto.fields.charged"),
  fields: [{
    text: sgt("charged.spinning"),
    node: input.display.charged.spinning,
    variant: stats => getTalentStatKeyVariant("charged", stats),
  }, {
    text: sgt("charged.final"),
    node: input.display.charged.final,
    variant: stats => getTalentStatKeyVariant("charged", stats),
  }, {
    text: sgt("charged.stamina"),
    value: data.charged.stam ?? 40,
    unit: "/s"
  }, {
    text: sgt("maxDuration"),
    value: data.charged.maxDuration ?? 5,
    unit: "s"
  }]
})

export const bowChargedDocSection = (tr, elementKey: ElementKey): DocumentSection => ({
  text: tr("auto.fields.charged"),
  fields: [{
    text: sgt("charged.aimed"),
    node: input.display.charged.hit,
    variant: stats => getTalentStatKeyVariant("charged", stats),
  }, {
    text: sgt("charged.fullyAimed"),
    node: input.display.charged.full,
    variant: stats => getTalentStatKeyVariant("charged", stats, elementKey),
  }]
})
type BoostKey = "autoBoost" | "skillBoost" | "burstBoost"
export const talentTemplate = (talentKey: TalentSheetElementKey, tr: (string) => Displayable, img: string, boostKey?: BoostKey, boostAmt: number = 3): TalentSheetElement => ({
  name: tr(`${talentKey}.name`),
  img,
  sections: [{
    text: tr(`${talentKey}.description`),
    ...(boostKey ? {
      conditional: {
        key: boostKey,
        canShow: stats => stats.constellation >= parseInt(talentKey.split("constellation")[1] ?? 3),
        maxStack: 0,
        stats: {
          [boostKey]: boostAmt
        }
      } as IConditional
    } : {})
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

import Assets from "../../Assets/Assets";
import { getTalentStatKey, getTalentStatKeyVariant } from "../../PageBuild/Build";
import ImgIcon from "../../Components/Image/ImgIcon";
import SqBadge from "../../Components/SqBadge";
import { Translate } from "../../Components/Translate";
import Stat from "../../Stat";
import { DocumentSection, TalentSheetElement, TalentSheetElementKey } from "../../Types/character";
import { ElementKey, WeaponTypeKey } from "../../Types/consts";
/**
 * @deprecated
 */
export const st = (strKey: string) => <Translate ns="sheet" key18={strKey} />
/**
 * @deprecated
 */
export const sgt = (strKey: string) => <Translate ns="sheet_gen" key18={strKey} />

//this template only works if there is no variation in normal attacks.(no multi hits)
/**
 * @deprecated
 */
export const normalDocSection = (tr, formula, data) => ({
  text: tr(`auto.fields.normal`),
  fields: data.normal.hitArr.map((percentArr, i) =>
  ({
    text: sgt(`normal.hit${i + 1}`),
    formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
    formula: formula.normal[i],
    variant: stats => getTalentStatKeyVariant("normal", stats),
  }))
})
/**
 * @deprecated
 */
export const chargedDocSection = (tr, formula, data, stamina = 25): DocumentSection => ({
  text: tr(`auto.fields.charged`),
  fields: [{
    text: sgt(`charged.dmg`),
    formulaText: stats => <span>{data.charged.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
    formula: formula.charged.dmg,
    variant: stats => getTalentStatKeyVariant("charged", stats),
  }, {
    text: sgt("charged.stamina"),
    value: stamina,
  }]
})
/**
 * @deprecated
 */
export const chargedHitsDocSection = (tr, formula, data, stamina = 20): DocumentSection => ({
  text: tr(`auto.fields.charged`),
  fields: [...data.charged.hitArr.map((percentArr, i) =>
  ({
    text: sgt(`normal.hit${i + 1}`),
    formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
    formula: formula.charged[i],
    variant: stats => getTalentStatKeyVariant("charged", stats),
  })), {
    text: sgt("charged.stamina"),
    value: stamina
  }]
})
/**
 * @deprecated
 */
export const plungeDocSection = (tr, formula, data): DocumentSection => ({
  text: tr`auto.fields.plunging`,
  fields: [{
    text: sgt(`plunging.dmg`),
    formulaText: stats => <span>{data.plunging.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
    formula: formula.plunging.dmg,
    variant: stats => getTalentStatKeyVariant("plunging", stats),
  }, {
    text: sgt("plunging.low"),
    formulaText: stats => <span>{data.plunging.low[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
    formula: formula.plunging.low,
    variant: stats => getTalentStatKeyVariant("plunging", stats),
  }, {
    text: sgt("plunging.high"),
    formulaText: stats => <span>{data.plunging.high[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
    formula: formula.plunging.high,
    variant: stats => getTalentStatKeyVariant("plunging", stats),
  }]
})
/**
 * @deprecated
 */
export const claymoreChargedDocSection = (tr, formula, data): DocumentSection => ({
  text: tr("auto.fields.charged"),
  fields: [{
    text: sgt("charged.spinning"),
    formulaText: stats => <span>{data.charged.spinning[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
    formula: formula.charged.spinning,
    variant: stats => getTalentStatKeyVariant("charged", stats),
  }, {
    text: sgt("charged.final"),
    formulaText: stats => <span>{data.charged.final[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
    formula: formula.charged.final,
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
/**
 * @deprecated
 */
export const bowChargedDocSection = (tr, formula, data, elementKey: ElementKey): DocumentSection => ({
  text: tr("auto.fields.charged"),
  fields: [{
    text: sgt("charged.aimed"),
    formulaText: stats => <span>{data.charged.hit[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
    formula: formula.charged.hit,
    variant: stats => getTalentStatKeyVariant("charged", stats),
  }, {
    text: sgt("charged.fullyAimed"),
    formulaText: stats => <span>{data.charged.full[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats, elementKey), stats)}</span>,
    formula: formula.charged.full,
    variant: stats => getTalentStatKeyVariant("charged", stats, elementKey),
  }]
})
type BoostKey = "autoBoost" | "skillBoost" | "burstBoost"
/**
 * @deprecated
 */
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
      }
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
/**
 * @deprecated
 */
export const conditionalHeader = (talentKey: TalentSheetElementKey, tr: (string) => Displayable, img: string) => {
  return {
    title: tr(`${talentKey}.name`),
    icon: <ImgIcon size={2} sx={{ m: -1 }} src={img} />,
    action: <SqBadge color="success">{talentStrMap[talentKey]}</SqBadge>,
  }
}
/**
 * @deprecated
 */
export const normalSrc = (weaponKey: WeaponTypeKey) => Assets.weaponTypes[weaponKey]

import { getTalentStatKey, getTalentStatKeyVariant } from "../../Build/Build";
import ImgIcon from "../../Components/Image/ImgIcon";
import SqBadge from "../../Components/SqBadge";
import { Translate } from "../../Components/Translate";
import Stat from "../../Stat";
import { TalentSheetElementKey } from "../../Types/character";
import { ElementKey } from "../../Types/consts";
import IConditional from "../../Types/IConditional";
export const st = (strKey: string) => <Translate ns="sheet" key18={strKey} />
export const sgt = (strKey: string) => <Translate ns="sheet_gen" key18={strKey} />

//this template only works if there is no variation in normal attacks.(no multi hits)
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
export const chargedDocSection = (tr, formula, data, stamina = 25) => ({
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
export const chargedHitsDocSection = (tr, formula, data, stamina = 20) => ({
  text: tr(`auto.fields.charged`),
  fields: [...data.charged.hitArr.map((percentArr, i) =>
  ({
    text: sgt(`normal.hit${i + 1}`),
    formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
    formula: formula.charged[i],
    variant: stats => getTalentStatKeyVariant("charged", stats),
  })), {
    test: sgt("charged.stamina"),
    value: stamina
  }]
})
export const plungeDocSection = (tr, formula, data) => ({
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

export const claymoreChargedDocSection = (tr, formula, data) => ({
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
    value: data.charged.stam ?? `40/s`,
  }, {
    text: sgt("maxDuration"),
    value: data.charged.maxDuration ?? `5s`,
  }]
})

export const bowChargedDocSection = (tr, formula, data, elementKey: ElementKey) => ({
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
export const talentTemplate = (talentKey: TalentSheetElementKey, tr: (string) => Displayable, img: string, boostKey?: BoostKey, boostAmt: number = 3) => ({
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
import { getTalentStatKey, getTalentStatKeyVariant } from "../../Build/Build";
import { TransWrapper } from "../../Components/Translate";
import Stat from "../../Stat";
import { ElementKey } from "../../Types/consts";
export const st = (strKey: string) => <TransWrapper ns="sheet" key18={strKey} />
export const sgt = (strKey: string) => <TransWrapper ns="sheet_gen" key18={strKey} />

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
    value: `40/s`,
  }, {
    text: sgt("maxDuration"),
    value: `5s`,
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
export const talentTemplate = (talentKey, tr, img, stats: undefined | object = undefined) => ({
  name: tr(`${talentKey}.name`),
  img,
  sections: [{ text: tr(`${talentKey}.description`), }],
  ...stats ? { stats } : {}
})
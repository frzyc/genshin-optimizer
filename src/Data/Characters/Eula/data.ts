import { FormulaItem, IFormulaSheet } from "../../../Types/character"
import { toTalentPercent } from "../../../Util/DataminedUtil"
import { basicDMGFormula } from "../../../Util/FormulaUtil"
import skillParam_gen_pre from './skillParam_gen.json'
const skillParam_gen = skillParam_gen_pre as any
let a = 0, s = 0, b = 0
export const data = {
  normal: {
    hitArr: [
      toTalentPercent(skillParam_gen.auto[a++]),
      toTalentPercent(skillParam_gen.auto[a++]),
      toTalentPercent(skillParam_gen.auto[a++]),//x2
      toTalentPercent(skillParam_gen.auto[a++]),
      toTalentPercent(skillParam_gen.auto[a++]),//x2
    ]
  },
  charged: {
    spinning: toTalentPercent(skillParam_gen.auto[a++]),
    final: toTalentPercent(skillParam_gen.auto[a++]),
    stam: skillParam_gen.auto[a++][0],
    maxDuration: skillParam_gen.auto[a++][0]
  },
  plunging: {
    dmg: toTalentPercent(skillParam_gen.auto[a++]),
    low: toTalentPercent(skillParam_gen.auto[a++]),
    high: toTalentPercent(skillParam_gen.auto[a++]),
  },
  skill: {
    pressDMG: toTalentPercent(skillParam_gen.skill[s++]),
    holdDMG: toTalentPercent(skillParam_gen.skill[s++]),
    brandDMG: toTalentPercent(skillParam_gen.skill[s++]),
    phyResDec: toTalentPercent(skillParam_gen.skill[s++]),
    cyroResDec: toTalentPercent(skillParam_gen.skill[s++]),
    resDecDuration: skillParam_gen.skill[s++][0],
    cdPress: skillParam_gen.skill[s++][0],
    cdHold: skillParam_gen.skill[s++][0],
    //TODO: 14?
    //TODO: neg of dec
    //TODO: neg of dec
    //TODO: 18?
  },
  burst: {
    dmg: toTalentPercent(skillParam_gen.burst[b++]),
    baseDMG: toTalentPercent(skillParam_gen.burst[b++]),
    stackDMG: toTalentPercent(skillParam_gen.burst[b++]),
    maxStack: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  }
} as const
const physicalBurst25 = (val, stats): FormulaItem => {
  val = val / 100
  const hitModeMultiKey = stats.hitMode === "avgHit" ? "burst_avgHit_base_multi" : stats.hitMode === "critHit" ? "critHit_base_multi" : ""
  return [s => val * s.finalATK * (hitModeMultiKey ? s[hitModeMultiKey] : 1) * (s.physical_burst_hit_base_multi + 0.25) * s.enemyLevel_multi * s.physical_enemyRes_multi, ["finalATK", ...(hitModeMultiKey ? [hitModeMultiKey] : []), "physical_burst_hit_base_multi", "enemyLevel_multi", "physical_enemyRes_multi"]]
}
const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "normal")])),
  charged: {
    spinning: stats => basicDMGFormula(data.charged.spinning[stats.tlvl.auto], stats, "charged"),
    final: stats => basicDMGFormula(data.charged.final[stats.tlvl.auto], stats, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    pressDMG: stats => basicDMGFormula(data.skill.pressDMG[stats.tlvl.skill], stats, "skill"),
    holdDMG: stats => basicDMGFormula(data.skill.holdDMG[stats.tlvl.skill], stats, "skill"),
    brandDMG: stats => basicDMGFormula(data.skill.brandDMG[stats.tlvl.skill], stats, "skill"),
  },
  burst: {
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
    ...Object.fromEntries([...Array(31).keys()].map(i =>
      [i, stats => basicDMGFormula(data.burst.baseDMG[stats.tlvl.burst] + i * data.burst.stackDMG[stats.tlvl.burst], stats, "burst", "physical")])),
    ...Object.fromEntries([...Array(31).keys()].map(i =>
      [`${i}_50`, stats => physicalBurst25(data.burst.baseDMG[stats.tlvl.burst] + i * data.burst.stackDMG[stats.tlvl.burst], stats)]))
  },
  passive1: {
    dmg: stats => basicDMGFormula(data.burst.baseDMG[stats.tlvl.burst] / 2, stats, "burst", "physical"),
    dmg50: stats => physicalBurst25(data.burst.baseDMG[stats.tlvl.burst] / 2, stats)
  },
}
export default formula
import { IFormulaSheet } from "../../../Types/character"
import { toTalentPercent } from "../../../Util/DataminedUtil"
import { basicDMGFormula } from "../../../Util/FormulaUtil"
import skillParam_gen_pre from './skillParam_gen.json'
const skillParam_gen = skillParam_gen_pre as any
export const data = {
  normal: {
    hitArr: [
      toTalentPercent(skillParam_gen.auto[0]),//x2
      toTalentPercent(skillParam_gen.auto[1]),
      toTalentPercent(skillParam_gen.auto[2]),
      toTalentPercent(skillParam_gen.auto[3]),//x2
      toTalentPercent(skillParam_gen.auto[4]),
    ]
  },
  charged: {
    hit: toTalentPercent(skillParam_gen.auto[5]),
    full: toTalentPercent(skillParam_gen.auto[6]),
    kindling: toTalentPercent(skillParam_gen.auto[7]),
  },
  plunging: {
    dmg: toTalentPercent(skillParam_gen.auto[8]),
    low: toTalentPercent(skillParam_gen.auto[9]),
    high: toTalentPercent(skillParam_gen.auto[10]),
  },
  skill: {
    dmg_: toTalentPercent(skillParam_gen.skill[3]),
  },
  burst: {
    dmg: toTalentPercent(skillParam_gen.burst[0]),
    exp: toTalentPercent(skillParam_gen.burst[1]),
  }
}
const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "charged", name === "hit" ? undefined : "pyro")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula((data.skill.dmg_[stats.tlvl.skill] / 100) * arr[stats.tlvl.auto], stats, "normal", "pyro")])),
  burst: Object.fromEntries(Object.entries(data.burst).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.burst], stats, "burst")])),
  c6: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula(0.6 * (data.skill.dmg_[stats.tlvl.skill] / 100) * arr[stats.tlvl.auto], stats, "normal", "pyro")])),
}
export default formula
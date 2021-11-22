import { IFormulaSheet } from "../../../Types/character"
import { singleToTalentPercent, toTalentPercent } from "../../../Util/DataminedUtil"
import { basicDMGFormula } from "../../../Util/FormulaUtil"
import skillParam_gen_pre from './skillParam_gen.json'
const skillParam_gen = skillParam_gen_pre as any
let a = 0, p1 = 0
export const data = {
  normal: {
    hitArr: [
      toTalentPercent(skillParam_gen.auto[a++]),//x2
      toTalentPercent(skillParam_gen.auto[a++]),
      toTalentPercent(skillParam_gen.auto[a++]),
      toTalentPercent(skillParam_gen.auto[a++]),//x2
      toTalentPercent(skillParam_gen.auto[a++]),
    ]
  },
  charged: {
    hit: toTalentPercent(skillParam_gen.auto[a++]),
    full: toTalentPercent(skillParam_gen.auto[a++]),
    kindling: toTalentPercent(skillParam_gen.auto[a++]),
  },
  plunging: {
    dmg: toTalentPercent(skillParam_gen.auto[a++]),
    low: toTalentPercent(skillParam_gen.auto[a++]),
    high: toTalentPercent(skillParam_gen.auto[a++]),
  },
  skill: {
    dmg_: toTalentPercent(skillParam_gen.skill[3]),
  },
  burst: {
    dmg: toTalentPercent(skillParam_gen.burst[0]),
    exp: toTalentPercent(skillParam_gen.burst[1]),
  },
  passive2: {
    fixed_atk_: singleToTalentPercent(skillParam_gen.passive2[p1++][0]),
    var_atk_: singleToTalentPercent(skillParam_gen.passive2[p1++][0]),
    duration: skillParam_gen.passive2[p1++][0],
  }
} as const
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
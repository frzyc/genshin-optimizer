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
  },
  plunging: {
    dmg: toTalentPercent(skillParam_gen.auto[7]),
    low: toTalentPercent(skillParam_gen.auto[8]),
    high: toTalentPercent(skillParam_gen.auto[9]),
  },
  skill: {
    dmg: toTalentPercent(skillParam_gen.skill[0]),
    atkRatio: toTalentPercent(skillParam_gen.skill[1]),
    duration: skillParam_gen.skill[2][0],
    cd: skillParam_gen.skill[3][0]
  },
  burst: {
    dmg: toTalentPercent(skillParam_gen.burst[0]),
    cluster: toTalentPercent(skillParam_gen.burst[1]),
    cd: skillParam_gen.skill[2][0],
    cost: skillParam_gen.skill[3][0],
  }
} as const
const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "charged", name === "hit" ? undefined : "electro")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
    atkBonus: stats => {
      const percent = (data.skill.atkRatio[stats.tlvl.skill]) / 100
      return [s => percent * s.baseATK, ["baseATK"]]
    }
  },
  burst: {
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
    cluster: stats => basicDMGFormula(data.burst.cluster[stats.tlvl.burst], stats, "burst")
  },
  c2: {
    dmg: stats => basicDMGFormula(0.3 * data.skill.dmg[stats.tlvl.skill], stats, "skill"),
  }
} as const
export default formula
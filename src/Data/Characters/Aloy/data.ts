import { IFormulaSheet } from "../../../Types/character"
import { toTalentPercent } from "../../../Util/DataminedUtil"
import { basicDMGFormula } from "../../../Util/FormulaUtil"
import skillParam_gen_pre from './skillParam_gen.json'
const skillParam_gen = skillParam_gen_pre as any
export const data = {
  normal: {
    hitArr: [
      toTalentPercent(skillParam_gen.auto[0]),//1.1
      toTalentPercent(skillParam_gen.auto[1]),//1.2
      toTalentPercent(skillParam_gen.auto[2]),//2
      toTalentPercent(skillParam_gen.auto[3]),//3
      toTalentPercent(skillParam_gen.auto[4]),//4
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
    bomblet: toTalentPercent(skillParam_gen.skill[1]),
    atkDec: toTalentPercent(skillParam_gen.skill[2]),
    atkDecDur: skillParam_gen.skill[3][0],
    coil1: toTalentPercent(skillParam_gen.skill[4]),
    coil2: toTalentPercent(skillParam_gen.skill[5]),
    coil3: toTalentPercent(skillParam_gen.skill[6]),
    coil4: toTalentPercent(skillParam_gen.skill[7]),
    rushDur: skillParam_gen.skill[8][0],
    cd: skillParam_gen.skill[8][0],
  },
  burst: {
    dmg: toTalentPercent(skillParam_gen.burst[0]),
    cd: skillParam_gen.burst[1][0],
    cost: skillParam_gen.burst[2][0],
  },
  a1: {
    duration: skillParam_gen.passive1[1],
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
    bomblet: stats => basicDMGFormula(data.skill.bomblet[stats.tlvl.skill], stats, "skill"),
  },
  burst: {
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
  }
} as const
export default formula
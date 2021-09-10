import { IFormulaSheet } from "../../../Types/character"
import { singleToTalentPercent, toTalentPercent } from "../../../Util/DataminedUtil"
import { basicDMGFormula } from "../../../Util/FormulaUtil"
import skillParam_gen_pre from './skillParam_gen.json'
const skillParam_gen = skillParam_gen_pre as any
let a = 0, s = 0, b = 0
export const data = {
  normal: {
    hitArr: [
      toTalentPercent(skillParam_gen.auto[a++]),//1
      toTalentPercent(skillParam_gen.auto[a++]),//2
      toTalentPercent(skillParam_gen.auto[a++]),//3
      toTalentPercent(skillParam_gen.auto[a++]),//4.1
      toTalentPercent(skillParam_gen.auto[a++]),//4.2
      toTalentPercent(skillParam_gen.auto[a++]),//5
    ],
  },
  charged: {
    hit1: toTalentPercent(skillParam_gen.auto[a++]),
    hit2: toTalentPercent(skillParam_gen.auto[a++]),
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: toTalentPercent(skillParam_gen.auto[a++]),
    low: toTalentPercent(skillParam_gen.auto[a++]),
    high: toTalentPercent(skillParam_gen.auto[a++]),
  },
  skill: {
    stilleto: toTalentPercent(skillParam_gen.skill[s++]),
    slashing: toTalentPercent(skillParam_gen.skill[s++]),
    thunderclasp_slash: toTalentPercent(skillParam_gen.skill[s++]),
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skill: toTalentPercent(skillParam_gen.burst[b++]),
    consec_slash: toTalentPercent(skillParam_gen.burst[b++]),
    last: toTalentPercent(skillParam_gen.burst[b++]),
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  constellation1: {
    dmg: singleToTalentPercent(skillParam_gen.constellation1[0]),
  },
  constellation4: {
    duration: skillParam_gen.constellation4[0],
    atk_: singleToTalentPercent(skillParam_gen.constellation4[1]),
  },
  constellation6: {
    electro_: singleToTalentPercent(skillParam_gen.constellation6[0]),
    duration: skillParam_gen.constellation6[1],
  }
} as const
const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "normal")])),
  charged: {
    hit1: stats => basicDMGFormula(data.charged.hit1[stats.tlvl.auto], stats, "charged"),
    hit2: stats => basicDMGFormula(data.charged.hit2[stats.tlvl.auto], stats, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    stilleto: stats => basicDMGFormula(data.skill.stilleto[stats.tlvl.skill], stats, "skill"),
    slashing: stats => basicDMGFormula(data.skill.slashing[stats.tlvl.skill], stats, "skill"),
    thunderclap_slashing: stats => basicDMGFormula(data.skill.thunderclasp_slash[stats.tlvl.skill], stats, "skill"),
  },
  burst: {
    skill: stats => basicDMGFormula(data.burst.skill[stats.tlvl.burst], stats, "burst"),
    consec_slash: stats => basicDMGFormula(data.burst.consec_slash[stats.tlvl.burst], stats, "burst"),
    last: stats => basicDMGFormula(data.burst.last[stats.tlvl.burst], stats, "burst"),
  },
  constellation1: {
    dmg: stats => basicDMGFormula(data.constellation1.dmg, stats, "elemental"),
  }
} as const
export default formula
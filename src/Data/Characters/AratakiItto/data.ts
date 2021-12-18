import { getTalentStatKey } from "../../../Build/Build"
import { FormulaItem, IFormulaSheet } from "../../../Types/character"
import { BasicStats } from "../../../Types/stats"
import { singleToTalentPercent, toTalentPercent } from "../../../Util/DataminedUtil"
import { basicDMGFormula } from "../../../Util/FormulaUtil"
import skillParam_gen_pre from './skillParam_gen.json'
const skillParam_gen = skillParam_gen_pre as any
let a = 0, s = 0, b = 0, p2 = 0, c4 = 0
export const data = {
  normal: {
    hitArr: [
      toTalentPercent(skillParam_gen.auto[a++]),
      toTalentPercent(skillParam_gen.auto[a++]),
      toTalentPercent(skillParam_gen.auto[a++]),
      toTalentPercent(skillParam_gen.auto[a++]),
    ]
  },
  charged: {
    sSlash: toTalentPercent(skillParam_gen.auto[a++]),
    akSlash: toTalentPercent(skillParam_gen.auto[a++]),
    akFinal: toTalentPercent(skillParam_gen.auto[a++]),
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: toTalentPercent(skillParam_gen.auto[a++]),
    low: toTalentPercent(skillParam_gen.auto[a++]),
    high: toTalentPercent(skillParam_gen.auto[a++]),
  },
  ss: { //Superlative Superstrength
    duration: skillParam_gen.auto[a++][0],
  },
  skill: {
    dmg: toTalentPercent(skillParam_gen.skill[s++]),
    hp: toTalentPercent(skillParam_gen.skill[s++]),
    duration: skillParam_gen.skill[s++][0],
    ss_cd: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    atkSpd: toTalentPercent(skillParam_gen.burst[b++]),
    defConv: toTalentPercent(skillParam_gen.burst[b++]),
    resDec: toTalentPercent(skillParam_gen.burst[b++]),
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    def: singleToTalentPercent(skillParam_gen.passive2[p2++][0]),
  },
  constellation4: {
    def_: singleToTalentPercent(skillParam_gen.constellation4[c4++]),
    atk_: singleToTalentPercent(skillParam_gen.constellation4[c4++]),
    duration: skillParam_gen.constellation4[c4++],
  }
} as const

function defDMGFormula(percent: number, stats: BasicStats): FormulaItem {
  const val = percent / 100
  const defMulti = data.passive2.def / 100
  const statKey = getTalentStatKey("charged", stats) + "_multi"
  return [s => (val * s.finalATK + defMulti * s.finalDEF) * s[statKey], ["finalATK", "finalDEF", statKey]]
}

const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "normal")])),
  charged: {
    sSlash: stats => basicDMGFormula(data.charged.sSlash[stats.tlvl.auto], stats, "charged"),
    akSlash: stats => basicDMGFormula(data.charged.akSlash[stats.tlvl.auto], stats, "charged"),
    akSlashA4: stats => defDMGFormula(data.charged.akSlash[stats.tlvl.auto], stats),
    akFinal: stats => basicDMGFormula(data.charged.akFinal[stats.tlvl.auto], stats, "charged"),
    akFinalA4: stats => defDMGFormula(data.charged.akFinal[stats.tlvl.auto], stats),
  },
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
    hp: stats => {
      const percent = data.skill.hp[stats.tlvl.skill] / 100
      return [s => percent * s.finalHP, ["finalHP"]]
    }
  },
  burst: {
    defConv: stats => {
      const val = data.burst.defConv[stats.tlvl.burst] / 100
      return [s => val * (s.premod?.finalDEF ?? s.finalDEF), ["finalDEF"]]
    }
  },
} as const
export default formula
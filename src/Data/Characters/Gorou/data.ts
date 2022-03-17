import { getTalentStatKey } from "../../../PageBuild/Build"
import { FormulaItem, IFormulaSheet } from "../../../Types/character"
import { singleToTalentPercent, toTalentInt, toTalentPercent } from "../../../Util/DataminedUtil"
import { basicDMGFormula } from "../../../Util/FormulaUtil"
import skillParam_gen_pre from './skillParam_gen.json'
const skillParam_gen = skillParam_gen_pre as any
let a = 0, s = 0, b = 0, p1 = 0, p2 = 0, c4 = 0, c6 = 0
export const data = {
  normal: {
    hitArr: [
      toTalentPercent(skillParam_gen.auto[a++]),
      toTalentPercent(skillParam_gen.auto[a++]),
      toTalentPercent(skillParam_gen.auto[a++]),
      toTalentPercent(skillParam_gen.auto[a++]),
    ],
  },
  charged: {
    hit: toTalentPercent(skillParam_gen.auto[a++]),
    full: toTalentPercent(skillParam_gen.auto[a++]),
  },
  plunging: {
    dmg: toTalentPercent(skillParam_gen.auto[a++]),
    low: toTalentPercent(skillParam_gen.auto[a++]),
    high: toTalentPercent(skillParam_gen.auto[a++]),
  },
  skill: {
    dmg: toTalentPercent(skillParam_gen.skill[s++]),
    def_: toTalentInt(skillParam_gen.skill[s++]),
    geo_dmg_: toTalentPercent(skillParam_gen.skill[s++]),
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: toTalentPercent(skillParam_gen.burst[b++]),
    dmgCollapse: toTalentPercent(skillParam_gen.burst[b++]),
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    def_: singleToTalentPercent(skillParam_gen.passive1[p1++][0]),
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    skill_def_: singleToTalentPercent(skillParam_gen.passive2[p2++][0]),
    burst_def_: singleToTalentPercent(skillParam_gen.passive2[p2++][0]),
  },
  constellation4: {
    heal_def_: singleToTalentPercent(skillParam_gen.constellation4[c4++]),
  },
  constellation6: {
    g1: singleToTalentPercent(skillParam_gen.constellation6[c6++]),
    g2: singleToTalentPercent(skillParam_gen.constellation6[c6++]),
    g3: singleToTalentPercent(skillParam_gen.constellation6[c6++]),
    duration: skillParam_gen.constellation6[c6++][0],
  }
} as const

function defDMGFormula(percent: number, defPercent: number, stats: any, skillKey: string): FormulaItem {
  const val = percent / 100
  const defMulti = defPercent / 100
  const statKey = getTalentStatKey(skillKey, stats) + "_multi"
  return [s => (val * s.finalATK + defMulti * s.finalDEF) * s[statKey], ["finalATK", "finalDEF", statKey]]
}

const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula((arr[stats.tlvl.auto]), stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "charged", name === "hit" ? undefined : "geo")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
    dmgA4: stats => defDMGFormula(data.skill.dmg[stats.tlvl.skill], data.passive2.skill_def_, stats, "skill"),
  },
  burst: {
    dmg: stats => {
      const percent = (data.burst.dmg[stats.tlvl.burst] + (stats.ascension >= 4 ? data.passive2.burst_def_ : 0)) / 100
      const key = getTalentStatKey("burst", stats) + "_multi"
      return [s => percent * s.finalDEF * s[key], [key, "finalDEF"]]
    },
    dmgCollapse: stats => {
      const percent = (data.burst.dmgCollapse[stats.tlvl.burst] + (stats.ascension >= 4 ? data.passive2.burst_def_ : 0)) / 100
      const key = getTalentStatKey("burst", stats) + "_multi"
      return [s => percent * s.finalDEF * s[key], [key, "finalDEF"]]
    },
  },
  constellation4: {
    heal: stats => {
      const percent = data.constellation4.heal_def_ / 100
      return [s => percent * s.finalDEF * s.heal_multi, ["finalDEF", "heal_multi"]]
    },
  }
} as const
export default formula

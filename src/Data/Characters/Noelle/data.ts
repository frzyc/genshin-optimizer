import { getTalentStatKey } from "../../../Build/Build"
import { IFormulaSheet } from "../../../Types/character"
import { toTalentInt, toTalentPercent } from "../../../Util/DataminedUtil"
import { basicDMGFormula } from "../../../Util/FormulaUtil"
import skillParam_gen_pre from './skillParam_gen.json'
const skillParam_gen = skillParam_gen_pre as any
let a = 0, s = 0, b = 0, p1 = 0
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
    spinning: toTalentPercent(skillParam_gen.auto[a++]),
    final: toTalentPercent(skillParam_gen.auto[a++]),
    stam: skillParam_gen.auto[a++][0],
    maxDuration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: toTalentPercent(skillParam_gen.auto[a++]),
    low: toTalentPercent(skillParam_gen.auto[a++]),
    high: toTalentPercent(skillParam_gen.auto[a++]),
  },
  skill: {
    shield_def_: toTalentPercent(skillParam_gen.skill[s++]),
    heal_def_: toTalentPercent(skillParam_gen.skill[s++]),
    heal_trigger: toTalentPercent(skillParam_gen.skill[s++]),
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    skill_dmg: toTalentPercent(skillParam_gen.skill[s++]),
    shield_flat: toTalentInt(skillParam_gen.skill[s++]),
    heal_flat: toTalentInt(skillParam_gen.skill[s++]),
  },
  burst: {
    burst_dmg: toTalentPercent(skillParam_gen.burst[b++]),
    skill_dmg: toTalentPercent(skillParam_gen.burst[b++]),
    bonus: toTalentPercent(skillParam_gen.burst[b++]),
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    trigger_chance: skillParam_gen.passive1[p1++][0],
    dmg_def_: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
    cd: skillParam_gen.passive1[p1++][0],
  }
} as const
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
    skill_dmg: stats => {
      const percent = data.skill.skill_dmg[stats.tlvl.skill] / 100, key = getTalentStatKey("skill", stats) + "_multi"
      return [s => percent * s[key] * s.finalDEF, [key, "finalDEF"]]
    },
    shield: stats => {
      const percent = data.skill.shield_def_[stats.tlvl.skill] / 100, flat = data.skill.shield_flat[stats.tlvl.skill]
      return [s => (percent * s.finalDEF + flat) * (1 + s.shield_ / 100) * 1.5, ["finalDEF", "shield_"]]
    },
    heal: stats => {
      const percent = data.skill.heal_def_[stats.tlvl.skill] / 100, flat = data.skill.heal_flat[stats.tlvl.skill]
      return [s => (percent * s.finalDEF + flat) * s.heal_multi, ["finalDEF", "heal_multi"]]
    },
  },
  burst: {
    burst_dmg: stats => basicDMGFormula(data.burst.burst_dmg[stats.tlvl.burst], stats, "burst"),
    skill_dmg: stats => basicDMGFormula(data.burst.skill_dmg[stats.tlvl.burst], stats, "burst"),
    bonus: stats => {
      const val = (data.burst.bonus[stats.tlvl.burst] + (stats.constellation >= 6 ? 50 : 0)) / 100
      return [s => val * (s.premod?.finalDEF ?? s.finalDEF), ["finalDEF"]]
    }
  },
  passive1: {
    hp: stats => [s => data.passive1.dmg_def_ * s.finalDEF * (1 + s.shield_ / 100) * 1.5, ["finalDEF", "shield_"]],
  },
  constellation4: {
    dmg: stats => basicDMGFormula(400, stats, "elemental"),
  },
} as const
export default formula
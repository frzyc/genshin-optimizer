import { getTalentStatKey } from "../../../Build/Build"
import { IFormulaSheet } from "../../../Types/character"
import { IConditionalValue } from "../../../Types/IConditional"
import { toTalentInt, toTalentPercent } from "../../../Util/DataminedUtil"
import { basicDMGFormula } from "../../../Util/FormulaUtil"
import { absorbableEle } from "../dataUtil"
import skillParam_gen_pre from './skillParam_gen.json'
const skillParam_gen = skillParam_gen_pre as any
export const data = {
  normal: {
    hitArr: [
      toTalentPercent(skillParam_gen.auto[0]),
      toTalentPercent(skillParam_gen.auto[1]),
      toTalentPercent(skillParam_gen.auto[2]),//x2
      toTalentPercent(skillParam_gen.auto[4]),
    ]
  },
  charged: {
    spinning: toTalentPercent(skillParam_gen.auto[5]),
    final: toTalentPercent(skillParam_gen.auto[6]),
  },
  plunging: {
    dmg: toTalentPercent(skillParam_gen.auto[9]),
    low: toTalentPercent(skillParam_gen.auto[10]),
    high: toTalentPercent(skillParam_gen.auto[11]),
  },
  skill: {
    dmg: toTalentPercent(skillParam_gen.skill[0]),
    ele_dmg: toTalentPercent(skillParam_gen.skill[1]),
    kick_press: toTalentPercent(skillParam_gen.skill[2]),
    kick_hold: toTalentPercent(skillParam_gen.skill[3]),
    ele_kick: toTalentPercent(skillParam_gen.skill[4]),
  },
  burst: {
    dmg: toTalentPercent(skillParam_gen.burst[0]),
    heal: toTalentInt(skillParam_gen.burst[1]),
    heal_: toTalentPercent(skillParam_gen.burst[2]),
    muji_dmg: toTalentPercent(skillParam_gen.burst[3]),
    muji_heal: toTalentInt(skillParam_gen.burst[4]),
    muji_heal_: toTalentPercent(skillParam_gen.burst[5]),
  }
}
const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
    kick_press: stats => {
      const skillPercent = data.skill.kick_press[stats.tlvl.skill]
      if (stats.constellation < 2) return basicDMGFormula(skillPercent, stats, "skill")
      const val = skillPercent / 100
      const statKey = getTalentStatKey("skill", stats)
      return [s => val * s[statKey] * 1.033, [statKey]]
    },
    kick_hold: stats => {
      const skillPercent = data.skill.kick_hold[stats.tlvl.skill]
      const basic = () => basicDMGFormula(skillPercent, stats, "skill")
      if (stats.constellation < 2) return basic()
      const value = stats.conditionalValues?.character?.sayu?.sheet?.talent?.c2 as IConditionalValue | undefined
      const [num] = value ?? [0]
      if (!num) return basic()

      const val = skillPercent / 100
      const statKey = getTalentStatKey("skill", stats)
      const multi = 1 + num * 0.033
      return [s => val * s[statKey] * multi, [statKey]]
    },
    ...Object.fromEntries([
      ...absorbableEle.map(eleKey => [eleKey, stats => basicDMGFormula(data.skill.ele_dmg[stats.tlvl.skill], stats, "skill", eleKey)]),
      ...absorbableEle.map(eleKey => [`${eleKey}_kick`, stats => basicDMGFormula(data.skill.ele_kick[stats.tlvl.skill], stats, "skill", eleKey)])
    ])
  },
  burst: {
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
    heal: stats => {
      const atk = data.burst.heal_[stats.tlvl.burst] / 100
      const flat = data.burst.heal[stats.tlvl.burst]
      return [s => (atk * s.finalATK + flat) * s.heal_multi, ["finalATK", "heal_multi"]]
    },
    muji_dmg: stats => basicDMGFormula(data.burst.muji_dmg[stats.tlvl.burst], stats, "burst"),
    muji_heal: stats => {
      const atk = data.burst.muji_heal_[stats.tlvl.burst] / 100
      const flat = data.burst.muji_heal[stats.tlvl.burst]
      return [s => (atk * s.finalATK + flat) * s.heal_multi, ["finalATK", "heal_multi"]]
    },
  },
  passive1: {
    heal: stats => [s => 1.2 * s.eleMas * s.heal_multi + 300, ["eleMas", "heal_multi"]],
  },
  passive2: {
    heal: stats => {
      const atk = data.burst.muji_heal_[stats.tlvl.burst] / 100
      const flat = data.burst.muji_heal[stats.tlvl.burst]
      return [s => 0.2 * (atk * s.finalATK + flat) * s.heal_multi, ["finalATK", "heal_multi"]]
    },
  }
}
export default formula
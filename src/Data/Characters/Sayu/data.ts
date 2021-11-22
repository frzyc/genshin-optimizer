import { getTalentStatKey } from "../../../Build/Build"
import { IFormulaSheet } from "../../../Types/character"
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
      const hitModeMultiKey = stats.hitMode === "avgHit" ? "skill_avgHit_base_multi" : stats.hitMode === "critHit" ? "critHit_base_multi" : ""
      return [s => skillPercent / 100 * s.finalATK * (hitModeMultiKey ? s[hitModeMultiKey] : 1) * (s.anemo_skill_hit_base_multi + 0.033) * s.enemyLevel_multi * s.anemo_enemyRes_multi,
      ["finalATK", ...(hitModeMultiKey ? [hitModeMultiKey] : []), "anemo_skill_hit_base_multi", "enemyLevel_multi", "anemo_enemyRes_multi"]]
    },
    kick_hold: stats => {
      const skillPercent = data.skill.kick_hold[stats.tlvl.skill]
      const basic = () => basicDMGFormula(skillPercent, stats, "skill")
      if (stats.constellation < 2) return basic()
      const [num] = stats.conditionalValues?.character?.Sayu?.c2 ?? []
      if (!num) return basic()

      const multi = num * 0.033
      const hitModeMultiKey = stats.hitMode === "avgHit" ? "skill_avgHit_base_multi" : stats.hitMode === "critHit" ? "critHit_base_multi" : ""
      return [s => skillPercent / 100 * s.finalATK * (hitModeMultiKey ? s[hitModeMultiKey] : 1) * (s.anemo_skill_hit_base_multi + multi) * s.enemyLevel_multi * s.anemo_enemyRes_multi,
      ["finalATK", ...(hitModeMultiKey ? [hitModeMultiKey] : []), "anemo_skill_hit_base_multi", "enemyLevel_multi", "anemo_enemyRes_multi"]]
    },
    ...Object.fromEntries([
      ...absorbableEle.map(eleKey => [eleKey, stats => basicDMGFormula(data.skill.ele_dmg[stats.tlvl.skill], stats, "skill", eleKey)]),
      ...absorbableEle.map(eleKey => [`${eleKey}_kick`, stats => {
        const skillPercent = data.skill.ele_kick[stats.tlvl.skill]
        const basic = () => basicDMGFormula(data.skill.ele_kick[stats.tlvl.skill], stats, "skill", eleKey)
        if (stats.constellation < 2) return basic()
        const [num] = stats.conditionalValues?.character?.Sayu?.c2 ?? []
        if (!num) return basic()

        const multi = num * 0.033
        const hitModeMultiKey = stats.hitMode === "avgHit" ? "skill_avgHit_base_multi" : stats.hitMode === "critHit" ? "critHit_base_multi" : ""
        return [s => skillPercent / 100 * s.finalATK * (hitModeMultiKey ? s[hitModeMultiKey] : 1) * (s[`${eleKey}_skill_hit_base_multi`] + multi) * s.enemyLevel_multi * s[`${eleKey}_enemyRes_multi`],
        ["finalATK", ...(hitModeMultiKey ? [hitModeMultiKey] : []), `${eleKey}_skill_hit_base_multi`, "enemyLevel_multi", `${eleKey}_enemyRes_multi`]]
      }])
    ])
  },
  burst: {
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
    heal: stats => {
      const atk = data.burst.heal_[stats.tlvl.burst] / 100
      const flat = data.burst.heal[stats.tlvl.burst]
      return [s => (atk * s.finalATK + flat) * s.heal_multi, ["finalATK", "heal_multi"]]
    },
    muji_dmg: stats => {
      if (stats.constellation < 6)
        return basicDMGFormula(data.burst.muji_dmg[stats.tlvl.burst], stats, "burst")
      else {
        const val = data.burst.muji_dmg[stats.tlvl.burst] / 100
        const statKey = getTalentStatKey("burst", stats)
        return [s => (val + Math.min(4, 0.002 * s.eleMas)) * s[statKey], [statKey, "eleMas"]]
      }
    },
    muji_heal: stats => {
      const atk = data.burst.muji_heal_[stats.tlvl.burst] / 100
      const flat = data.burst.muji_heal[stats.tlvl.burst]
      if (stats.constellation < 6) return [s => (atk * s.finalATK + flat) * s.heal_multi, ["finalATK", "heal_multi"]]
      else return [s => (atk * s.finalATK + flat + Math.min(6000, 3 * s.eleMas)) * s.heal_multi, ["finalATK", "heal_multi", "eleMas"]]
    },
  },
  passive1: {
    heal: stats => [s => (1.2 * s.eleMas + 300) * s.heal_multi, ["eleMas", "heal_multi"]],
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
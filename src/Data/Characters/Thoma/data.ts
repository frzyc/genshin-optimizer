import { getTalentStatKey } from "../../../Build/Build"
import { IFormulaSheet } from "../../../Types/character"
import { singleToTalentPercent, toTalentInt, toTalentPercent } from "../../../Util/DataminedUtil"
import { basicDMGFormula } from "../../../Util/FormulaUtil"
import skillParam_gen_pre from './skillParam_gen.json'
const skillParam_gen = skillParam_gen_pre as any
let a = 0, s = 0, b = 0, p1 = 0, c6 = 0;
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
    dmg: toTalentPercent(skillParam_gen.auto[a++]),
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: toTalentPercent(skillParam_gen.auto[a++]),
    low: toTalentPercent(skillParam_gen.auto[a++]),
    high: toTalentPercent(skillParam_gen.auto[a++]),
  },
  skill: {
    dmg: toTalentPercent(skillParam_gen.skill[s++]),
    shieldHp_: toTalentPercent(skillParam_gen.skill[s++]),
    shieldHp: toTalentInt(skillParam_gen.skill[s++]),
    duration: skillParam_gen.skill[s++][0],
    maxShieldHp_: toTalentPercent(skillParam_gen.skill[s++]),
    maxShieldHp: toTalentInt(skillParam_gen.skill[s++]),
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: toTalentPercent(skillParam_gen.burst[b++]),
    dmgCollapse: toTalentPercent(skillParam_gen.burst[b++]),
    shieldHp_: toTalentPercent(skillParam_gen.burst[b++]),
    shieldHp: toTalentInt(skillParam_gen.burst[b++]),
    shieldDuration: skillParam_gen.burst[b++][0],
    triggerDuration: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    shield_: singleToTalentPercent(skillParam_gen.passive1[p1++][0]),
    duration: skillParam_gen.passive1[p1++][0],
    maxStack: skillParam_gen.passive1[p1++][0],
    trigger: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    hp_: singleToTalentPercent(skillParam_gen.passive2[0][0]),
  },
  constellation2: {
    duration: skillParam_gen.constellation2[0],
  },
  constellation6: {
    auto_: singleToTalentPercent(skillParam_gen.constellation6[c6++]),
    duration: skillParam_gen.constellation6[c6++],
  }
} as const

const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula((arr[stats.tlvl.auto]), stats, "normal")])),
  charged: {
    dmg: stats => basicDMGFormula(data.charged.dmg[stats.tlvl.auto], stats, "charged")
  },
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
    shield: stats => {
      const hp = data.skill.shieldHp_[stats.tlvl.skill] / 100
      const flat = data.skill.shieldHp[stats.tlvl.skill]
      const shdStr = 1
      return [s => (hp * s.finalHP + flat) * (1 + s.shield_ / 100) * shdStr, ["finalHP", "shield_"]]
    },
    shieldPyro: stats => {
      const hp = data.skill.shieldHp_[stats.tlvl.skill] / 100
      const flat = data.skill.shieldHp[stats.tlvl.skill]
      const shdStr = 2.5
      return [s => (hp * s.finalHP + flat) * (1 + s.shield_ / 100) * shdStr, ["finalHP", "shield_"]]
    },
    maxShield: stats => {
      const hp = data.skill.maxShieldHp_[stats.tlvl.skill] / 100
      const flat = data.skill.maxShieldHp[stats.tlvl.skill]
      const shdStr = 1
      return [s => (hp * s.finalHP + flat) * (1 + s.shield_ / 100) * shdStr, ["finalHP", "shield_"]]
    },
    maxShieldPyro: stats => {
      const hp = data.skill.maxShieldHp_[stats.tlvl.skill] / 100
      const flat = data.skill.maxShieldHp[stats.tlvl.skill]
      const shdStr = 2.5
      return [s => (hp * s.finalHP + flat) * (1 + s.shield_ / 100) * shdStr, ["finalHP", "shield_"]]
    },
  },
  burst: {
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
    dmgCollapse: stats => basicDMGFormula(data.burst.dmgCollapse[stats.tlvl.burst], stats, "burst"),
    dmgCollapseA4: stats => {
      const val = data.burst.dmgCollapse[stats.tlvl.burst] / 100
      const hp_ = data.passive2.hp_ / 100
      const statKey = getTalentStatKey("burst", stats) + "_multi"
      return [s => (val * s.finalATK + hp_ * s.finalHP) * s[statKey], ["finalHP", "finalATK", statKey]]
    },
    shield: stats => {
      const hp = data.burst.shieldHp_[stats.tlvl.burst] / 100
      const flat = data.burst.shieldHp[stats.tlvl.burst]
      const shdStr = 1
      return [s => (hp * s.finalHP + flat) * (1 + s.shield_ / 100) * shdStr, ["finalHP", "shield_"]]
    },
    shieldPyro: stats => {
      const hp = data.burst.shieldHp_[stats.tlvl.burst] / 100
      const flat = data.burst.shieldHp[stats.tlvl.burst]
      const shdStr = 2.5
      return [s => (hp * s.finalHP + flat) * (1 + s.shield_ / 100) * shdStr, ["finalHP", "shield_"]]
    },
  }
} as const
export default formula
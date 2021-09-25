import { getTalentStatKey } from "../../../Build/Build"
import { FormulaItem, IFormulaSheet } from "../../../Types/character"
import { BasicStats } from "../../../Types/stats"
import { singleToTalentPercent, toTalentInt, toTalentPercent } from "../../../Util/DataminedUtil"
import { basicDMGFormula } from "../../../Util/FormulaUtil"
import skillParam_gen_pre from './skillParam_gen.json'
const skillParam_gen = skillParam_gen_pre as any
let a = 0, s = 0, b = 0, c6 = 0
export const data = {
  normal: {
    hitArr: [
      toTalentPercent(skillParam_gen.auto[a++]),
      toTalentPercent(skillParam_gen.auto[a++]),
      toTalentPercent(skillParam_gen.auto[a++]),
    ]
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
    heal_: toTalentPercent(skillParam_gen.skill[s++]),
    heal: toTalentInt(skillParam_gen.skill[s++]),
    dmg: toTalentPercent(skillParam_gen.skill[s++]),
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: toTalentPercent(skillParam_gen.burst[b++]),
    heal_: toTalentPercent(skillParam_gen.burst[b++]),
    heal: toTalentInt(skillParam_gen.burst[b++]),
    nBonus: toTalentPercent(skillParam_gen.burst[b++]),
    cBonus: toTalentPercent(skillParam_gen.burst[b++]),
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
    sBonus: toTalentPercent(skillParam_gen.burst[b++]),
  },
  p2: {
    heal_ratio: singleToTalentPercent(skillParam_gen.passive2[0][0]),
  },
  c1: {
    hp_: singleToTalentPercent(skillParam_gen.constellation1[0]),
  },
  c2: {
    s_heal_: singleToTalentPercent(skillParam_gen.constellation2[1]),
    nc_heal_: singleToTalentPercent(skillParam_gen.constellation2[2]),
  },
  c4: {
    atkSPD_: singleToTalentPercent(skillParam_gen.constellation4[0]),
    energy: skillParam_gen.constellation4[1]
  },
  c6: {
    hp_: singleToTalentPercent(skillParam_gen.constellation6[c6++]),
    hydro_: singleToTalentPercent(skillParam_gen.constellation6[c6++]),
    duration: skillParam_gen.constellation6[c6++]
  },
} as const

function hpDMGFormula(percent: number, hpPercent: number, stats: BasicStats, skillKey: string): FormulaItem {
  const val = percent / 100
  const hpMulti = hpPercent / 100
  const hasA4 = stats.ascension >= 4 && ["normal", "charged"].includes(skillKey)
  const statKey = getTalentStatKey(skillKey, stats) + "_multi"
  const heal_ratio = data.p2.heal_ratio / 100
  return [s => (val * s.finalATK + (hpMulti + (hasA4 ? (heal_ratio * s.heal_ / 100) : 0)) * s.finalHP) * s[statKey], ["finalATK", "finalHP", ...(hasA4 ? ["heal_"] : []), statKey]]
}
const formula: IFormulaSheet = {
  normal: {
    ...Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, stats =>
      basicDMGFormula(percentArr[stats.tlvl.auto], stats, "normal")])),
    ...Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [`${i}HP`, stats =>
      hpDMGFormula(percentArr[stats.tlvl.auto], data.burst.nBonus[stats.tlvl.burst], stats, "normal")])),
  },
  charged: {
    dmg: stats => basicDMGFormula(data.charged.dmg[stats.tlvl.auto], stats, "charged"),
    dmgHP: stats => hpDMGFormula(data.charged.dmg[stats.tlvl.auto], data.burst.cBonus[stats.tlvl.burst], stats, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
    dmgHP: stats => hpDMGFormula(data.charged.dmg[stats.tlvl.skill], data.burst.sBonus[stats.tlvl.burst], stats, "skill"),
    regen: stats => {
      const hp = data.skill.heal_[stats.tlvl.skill] / 100
      const flat = data.skill.heal[stats.tlvl.skill]
      return [s => (hp * s.finalHP + flat) * s.heal_multi, ["finalHP", "heal_multi"]]
    },
    regenC2: stats => {
      const hp = (data.skill.heal_[stats.tlvl.skill] + data.c2.s_heal_) / 100
      const flat = data.skill.heal[stats.tlvl.skill]
      return [s => (hp * s.finalHP + flat) * s.heal_multi, ["finalHP", "heal_multi"]]
    },
  },
  burst: {
    dmg: stats => {
      const val = data.burst.dmg[stats.tlvl.burst] / 100
      const statKey = `${getTalentStatKey("burst", stats)}_multi`
      return [s => val * s.finalHP * s[statKey], ["finalHP", statKey]]
    },
    regen: stats => {
      const hp = data.burst.heal_[stats.tlvl.burst] / 100
      const flat = data.burst.heal[stats.tlvl.burst]
      return [s => (hp * s.finalHP + flat) * s.heal_multi, ["finalHP", "heal_multi"]]
    },
    regenC2: stats => {
      const hp = (data.burst.heal_[stats.tlvl.burst] + data.c2.nc_heal_) / 100
      const flat = data.burst.heal[stats.tlvl.burst]
      return [s => (hp * s.finalHP + flat) * s.heal_multi, ["finalHP", "heal_multi"]]
    },
  },
  c1: {
    dmg: stats => {
      const val = data.c1.hp_ / 100
      const statKey = getTalentStatKey("elemental", stats) + "_multi"
      return [s => val * s.finalHP * s[statKey], ["finalHP", statKey]]
    }
  }
} as const
export default formula
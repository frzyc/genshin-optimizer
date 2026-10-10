import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Clorinde'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[(a += 2)], // 3x2
      skillParam_gen.auto[(a += 3)], // 4x3
      skillParam_gen.auto[++a], // 5
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    normalDmg: skillParam_gen.skill[s++],
    piercingDmg: skillParam_gen.skill[s++],
    bond: skillParam_gen.skill[s++][0],
    thrust1Dmg: skillParam_gen.skill[s++],
    thrust2Dmg: skillParam_gen.skill[s++],
    thrust2Heal: skillParam_gen.skill[s++][0],
    thrust3Dmg: skillParam_gen.skill[s++],
    thrust3Heal: skillParam_gen.skill[s++][0],
    bondHealConvert: skillParam_gen.skill[s++][0],
    bladeDmg: skillParam_gen.skill[s++],
    bladeInterval: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    bond: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
    maxDmgInc: skillParam_gen.passive1[1][0],
    atkRatio: skillParam_gen.passive1[2][0],
    maxStacks: 3,
  },
  passive2: {
    bondThreshold: skillParam_gen.passive2[0][0],
    bondHealConvert: skillParam_gen.passive2[1][0],
    critRate_: skillParam_gen.passive2[2][0],
    duration: skillParam_gen.passive2[3][0],
    maxStacks: 2,
  },
  constellation1: {
    idk: skillParam_gen.constellation1[0],
    dmg: skillParam_gen.constellation1[1],
    cd: skillParam_gen.constellation1[2],
    multi: 2,
  },
  constellation2: {
    maxDmgInc: skillParam_gen.constellation2[0],
    atkRatio: skillParam_gen.constellation2[1],
  },
  constellation4: {
    burst_dmg_: skillParam_gen.constellation4[0],
    max_burst_dmg_: skillParam_gen.constellation4[1],
  },
  constellation6: {
    critRate_: skillParam_gen.constellation6[0],
    critDMG_: skillParam_gen.constellation6[1],
    dmgReducDuration: skillParam_gen.constellation6[2],
    dmgReduc: skillParam_gen.constellation6[3],
    dmg: skillParam_gen.constellation6[4],
    maxShades: skillParam_gen.constellation6[5],
    critDuration: skillParam_gen.constellation6[6],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'c6AfterSkill') `'on'`
const { c6AfterSkill } = allBoolConditionals(info.key)
// WR lookup(cond(key, 'a1Reactions'), 1..3)
const { a1Reactions } = allNumConditionals(
  info.key,
  true,
  0,
  dm.passive1.maxStacks
)
// WR lookup(cond(key, 'a4BondChanges'), 1..2)
const { a4BondChanges } = allNumConditionals(
  info.key,
  true,
  0,
  dm.passive2.maxStacks
)
// WR lookup(cond(key, 'c4BondPercent'), 10..100 by 5)
const { c4BondPercent } = allNumConditionals(
  info.key,
  true,
  0,
  dm.constellation4.max_burst_dmg_ / dm.constellation4.burst_dmg_
)

const a1AtkRatio = cmpGE(
  constellation,
  2,
  percent(dm.constellation2.atkRatio),
  percent(dm.passive1.atkRatio)
)
const a1MaxDmgInc = cmpGE(
  constellation,
  2,
  dm.constellation2.maxDmgInc,
  dm.passive1.maxDmgInc
)
// WR min(maxDmgInc, atkRatio * total.atk * stacks). final.atk is OK on listings.
const a1DmgInc = cmpGE(
  ascension,
  1,
  min(a1MaxDmgInc, prod(a1AtkRatio, final.atk, a1Reactions))
)
const a4BondChanges_critRate_ = cmpGE(
  ascension,
  4,
  prod(a4BondChanges, percent(dm.passive2.critRate_))
)
const c4_burst_dmg_ = cmpGE(
  constellation,
  4,
  prod(percent(dm.constellation4.burst_dmg_), c4BondPercent)
)
const c6AfterSkill_critRate_ = c6AfterSkill.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.critRate_))
)
const c6AfterSkill_critDMG_ = c6AfterSkill.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.critDMG_))
)

function skillNormal(name: string, table: number[]) {
  return customDmg(
    name,
    'electro',
    'normal',
    prod(percent(talentSubscript(skill, table)), final.atk),
    undefined,
    // WR dmgNode overlay premod.normal_dmgInc (A1), talent from skill
    ownBuff.formula.base.add(a1DmgInc)
  )
}

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 I Pledge to Remember the Oath of Daylight (skill); C5 Holding Dawn's Coming as My Votive (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // WR premod.burst_dmgInc
  ownBuff.formula.base.burst.add(a1DmgInc),
  ownBuff.premod.critRate_.add(a4BondChanges_critRate_),
  ownBuff.premod.dmg_.burst.add(c4_burst_dmg_),
  ownBuff.premod.critRate_.add(c6AfterSkill_critRate_),
  ownBuff.premod.critDMG_.add(c6AfterSkill_critDMG_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  skillNormal('skill_normalDmg', dm.skill.normalDmg),
  skillNormal('skill_piercingDmg', dm.skill.piercingDmg),
  skillNormal('skill_thrust1Dmg', dm.skill.thrust1Dmg),
  skillNormal('skill_thrust2Dmg', dm.skill.thrust2Dmg),
  skillNormal('skill_thrust3Dmg', dm.skill.thrust3Dmg),
  // WR bladeDmg sets hit.reaction to '' (Arkhe); Pando has no no-react overlay.
  dmg('skill_bladeDmg', info, 'atk', dm.skill.bladeDmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  customDmg(
    'c1',
    'electro',
    'normal',
    prod(percent(dm.constellation1.dmg), final.atk),
    { cond: cmpGE(constellation, 1, 'infer', '') },
    ownBuff.formula.base.add(a1DmgInc)
  ),
  customDmg(
    'c6',
    'electro',
    'normal',
    prod(percent(dm.constellation6.dmg), final.atk),
    { cond: cmpGE(constellation, 6, 'infer', '') },
    ownBuff.formula.base.add(a1DmgInc)
  )
)

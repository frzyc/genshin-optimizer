import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  cmpEq,
  cmpGE,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customDmg,
  own,
  ownBuff,
  percent,
  register,
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Skirk'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = -1,
  s = -1,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[(a += 2)], // 3x2
      skillParam_gen.auto[++a], // 4
      skillParam_gen.auto[++a], // 5
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a], // x2
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    hitArr: [
      skillParam_gen.skill[++s], // 1
      skillParam_gen.skill[++s], // 2
      skillParam_gen.skill[(s += 2)], // 3x2
      skillParam_gen.skill[(s += 2)], // 4x2
      skillParam_gen.skill[++s], // 5
    ],
    charged: {
      dmg: skillParam_gen.skill[++s], // x3
      stam: skillParam_gen.skill[++s][0],
    },
    plunging: {
      dmg: skillParam_gen.skill[++s],
      low: skillParam_gen.skill[++s],
      high: skillParam_gen.skill[++s],
    },
    duration: skillParam_gen.skill[++s][0],
    maxSerpent: skillParam_gen.skill[++s][0],
    cd: skillParam_gen.skill[++s][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    finalDmg: skillParam_gen.burst[b++],
    serpentBonus: skillParam_gen.burst[b++],
    maxSerpentFactor: 12,
    void_dmg_: [
      skillParam_gen.burst[b++],
      skillParam_gen.burst[b++],
      skillParam_gen.burst[b++],
      skillParam_gen.burst[b++],
    ],
    cd: skillParam_gen.burst[b++][0],
    maxTriggers: 10,
    triggerCd: 0.1,
  },
  passive1: {
    serpentGain: skillParam_gen.passive1[0][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
    normal_mult_: [
      skillParam_gen.passive2[1][0],
      skillParam_gen.passive2[2][0],
      skillParam_gen.passive2[3][0],
    ],
    burst_mult_: [
      skillParam_gen.passive2[4][0],
      skillParam_gen.passive2[5][0],
      skillParam_gen.passive2[6][0],
    ],
  },
  constellation1: {
    dmg: skillParam_gen.constellation1[0],
  },
  constellation2: {
    addlSerpentFactor: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    atk_: skillParam_gen.constellation2[2],
  },
  constellation4: {
    atk_: [
      skillParam_gen.constellation4[0],
      skillParam_gen.constellation4[1],
      skillParam_gen.constellation4[2],
    ],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[0],
    burstDmg: skillParam_gen.constellation6[1],
    normalDmg: skillParam_gen.constellation6[2],
    dmgDecrease: skillParam_gen.constellation6[3],
    chargedDmg: skillParam_gen.constellation6[4],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { auto, skill, burst, ascension, constellation },
} = own
// WR cond(key, 'c2AfterBurst') `'on'`
const { c2AfterBurst } = allBoolConditionals(info.key)
// WR lookup(cond(key, 'burstVoidAbsorb'), 0..3)
const { burstVoidAbsorb } = allListConditionals(info.key, ['0', '1', '2', '3'])
// WR lookup(cond(key, 'a4DeathStacks'), 1..3)
const { a4DeathStacks } = allNumConditionals(info.key, true, 0, 3)
// WR lookup(cond(key, 'burstSerpentOver'), 1..12; 13..22 C2-gated)
const { burstSerpentOver } = allNumConditionals(
  info.key,
  true,
  0,
  dm.burst.maxSerpentFactor + dm.constellation2.addlSerpentFactor
)

const a4DeathStacks_skillNormal_mult_ = cmpGE(
  ascension,
  4,
  percent(sum(1, subscript(a4DeathStacks, [0, ...dm.passive2.normal_mult_]))),
  1
)
const a4DeathStacks_burst_mult_ = cmpGE(
  ascension,
  4,
  percent(sum(1, subscript(a4DeathStacks, [0, ...dm.passive2.burst_mult_]))),
  1
)

const burstSerpentOverStacks = cmpGE(
  burstSerpentOver,
  dm.burst.maxSerpentFactor + 1,
  cmpGE(constellation, 2, burstSerpentOver),
  burstSerpentOver
)
// WR burst_dmgInc uses global total.atk (includes C2), not the listing overlay.
const burstSerpentOver_burst_dmgInc = prod(
  burstSerpentOverStacks,
  percent(talentSubscript(burst, dm.burst.serpentBonus)),
  a4DeathStacks_burst_mult_,
  final.atk
)

const burstVoidAbsorb_normal_dmg_ = sum(
  prod(
    burstVoidAbsorb.map({ '0': 1 }),
    percent(talentSubscript(burst, dm.burst.void_dmg_[0]))
  ),
  prod(
    burstVoidAbsorb.map({ '1': 1 }),
    percent(talentSubscript(burst, dm.burst.void_dmg_[1]))
  ),
  prod(
    burstVoidAbsorb.map({ '2': 1 }),
    percent(talentSubscript(burst, dm.burst.void_dmg_[2]))
  ),
  prod(
    burstVoidAbsorb.map({ '3': 1 }),
    percent(talentSubscript(burst, dm.burst.void_dmg_[3]))
  )
)

const c2_atk_ = c2AfterBurst.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.atk_))
)
const c2_inverted_atk_ = prod(c2_atk_, -1)
const c4DeathStacks_atk_ = cmpGE(
  constellation,
  4,
  cmpGE(
    ascension,
    4,
    percent(subscript(a4DeathStacks, [0, ...dm.constellation4.atk_]))
  )
)

// WR tally.cryo>=1 ∧ hydro>=1 ∧ cryo+hydro == sum(all elements).
const a0SkillBoost = cmpGE(
  team.common.count.cryo,
  1,
  cmpGE(
    team.common.count.hydro,
    1,
    cmpEq(
      sum(team.common.count.cryo, team.common.count.hydro),
      sum(...allElementKeys.map((ele) => team.common.count[ele])),
      1
    )
  )
)

const c1On = cmpGE(constellation, 1, cmpGE(ascension, 1, 'infer', ''), '')
const c6On = cmpGE(constellation, 6, cmpGE(ascension, 1, 'infer', ''), '')

function autoHit(
  name: string,
  table: number[],
  move: 'normal' | 'charged' | 'plunging'
) {
  return dmg(
    name,
    info,
    'atk',
    table,
    move,
    undefined,
    // WR dmgNode overlay premod.atk_ = -c2; fold into formula.base (no atk_ overlay).
    ownBuff.formula.base.add(
      prod(
        percent(talentSubscript(auto, table)),
        own.base.atk,
        c2_inverted_atk_
      )
    )
  )
}

function skillHit(
  name: string,
  table: number[],
  move: 'normal' | 'charged' | 'plunging',
  baseMulti?: typeof a4DeathStacks_skillNormal_mult_
) {
  return customDmg(
    name,
    'cryo',
    move,
    prod(
      percent(talentSubscript(skill, table)),
      final.atk,
      ...(baseMulti ? [baseMulti] : [])
    )
  )
}

function burstHit(name: string, table: number[]) {
  return customDmg(
    name,
    'cryo',
    'burst',
    prod(
      percent(talentSubscript(burst, table)),
      sum(final.atk, prod(own.base.atk, c2_inverted_atk_)),
      a4DeathStacks_burst_mult_
    ),
    undefined,
    ownBuff.formula.base.add(burstSerpentOver_burst_dmgInc)
  )
}

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Serendipitous Sin (burst); C5 End of Wishes (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk_.add(c2_atk_),
  ownBuff.premod.atk_.add(c4DeathStacks_atk_),
  ownBuff.premod.dmg_.normal.add(burstVoidAbsorb_normal_dmg_),
  // WR teamBuff.premod.skillBoost — whole party, not dest-gated.
  teamBuff.char.skill.add(a0SkillBoost),

  dm.normal.hitArr.flatMap((arr, i) => autoHit(`normal_${i}`, arr, 'normal')),
  autoHit('charged', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    autoHit(`plunging_${k}`, v, 'plunging')
  ),
  // WR skill NA/CA/plunge: hitEle.cryo, talent from skill. listing-local cryo
  // (infusionPrio has no cryo channel). Seven-Phase Flash is not a toggle.
  dm.skill.hitArr.flatMap((arr, i) =>
    skillHit(`skill_${i}`, arr, 'normal', a4DeathStacks_skillNormal_mult_)
  ),
  skillHit('skill_chargedDmg', dm.skill.charged.dmg, 'charged'),
  Object.entries(dm.skill.plunging).flatMap(([k, v]) =>
    skillHit(`skill_plunging_${k}`, v, 'plunging')
  ),
  burstHit('burst_skillDmg', dm.burst.skillDmg),
  burstHit('burst_finalDmg', dm.burst.finalDmg),
  customDmg(
    'c1',
    'cryo',
    'charged',
    prod(percent(dm.constellation1.dmg), final.atk),
    { cond: c1On }
  ),
  customDmg(
    'c6_burst',
    'cryo',
    'burst',
    prod(
      percent(dm.constellation6.burstDmg),
      sum(final.atk, prod(own.base.atk, c2_inverted_atk_)),
      a4DeathStacks_burst_mult_
    ),
    { cond: c6On }
  ),
  customDmg(
    'c6_normal',
    'cryo',
    'normal',
    prod(
      percent(dm.constellation6.normalDmg),
      final.atk,
      a4DeathStacks_skillNormal_mult_
    ),
    { cond: c6On }
  ),
  customDmg(
    'c6_charged',
    'cryo',
    'charged',
    prod(percent(dm.constellation6.chargedDmg), final.atk),
    { cond: c6On }
  )
)

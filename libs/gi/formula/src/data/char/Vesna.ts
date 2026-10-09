import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import { infusionPrio } from '../common/dmg'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Vesna'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5
      skillParam_gen.auto[a++], // 6
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    sword1Dmg: skillParam_gen.skill[s++],
    sword2Dmg: skillParam_gen.skill[s++],
    sword2SpiritDmg: skillParam_gen.skill[s++],
    sword2SpiritStellarswirlDmg: skillParam_gen.skill[s++],
    sword3SpiritDmg: skillParam_gen.skill[s++], // x4
    sword3SpiritStellarswirlDmg: skillParam_gen.skill[s++], // x4
    sword3SpiritFinalDmg: skillParam_gen.skill[s++],
    sword3SpiritFinalStellarswirlDmg: skillParam_gen.skill[s++],
    windPinionDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    five: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    spiritDmg: skillParam_gen.burst[b++],
    spiritStellarswirlDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
    maxStacks: skillParam_gen.passive1[1][0],
    spiritMult_: skillParam_gen.passive1[2][0],
  },
  passive2: {
    atk_: skillParam_gen.passive2[0][0],
    eleMas: skillParam_gen.passive2[1][0],
  },
  passive3: {
    base_stellarswirl_dmg_: skillParam_gen.passive3![0][0],
    maxBase_stellarswirl_dmg_: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    five: skillParam_gen.constellation1[0],
    stellarswirl_dmg_: skillParam_gen.constellation1[1],
  },
  constellation2: {
    atk_: skillParam_gen.constellation2[0],
  },
  constellation4: {
    additionalBuffMult: skillParam_gen.constellation4[0],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[0],
    transposeDmg: skillParam_gen.constellation6[1],
    spiritDmg: skillParam_gen.constellation6[2],
    stellarswirl_specialDmg_: skillParam_gen.constellation6[3],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'skillArmed') `'on'`
const { skillArmed } = allBoolConditionals(info.key)
// WR cond(key, 'a0StellarRadiance') — Vesna uses unset vs `'ss'`
const { a0StellarRadiance } = allListConditionals(info.key, ['ss'])
// WR lookup(cond(key, 'a1Stacks'), 1..maxStacks); default off = 0
const { a1Stacks } = allNumConditionals(
  info.key,
  true,
  0,
  dm.passive1.maxStacks
)

const radianceSs = a0StellarRadiance.map({ ss: 1 })
const ssOn = cmpGE(radianceSs, 1, 'infer', '')
const unsetOn = cmpGE(radianceSs, 1, '', 'infer')

const a0_stellarswirl_baseDmg_ = min(
  prod(percent(dm.passive3.base_stellarswirl_dmg_), final.atk, 1 / 100),
  percent(dm.passive3.maxBase_stellarswirl_dmg_)
)

const a1Stacks_spiritMult_ = sum(
  1,
  cmpGE(ascension, 1, prod(percent(dm.passive1.spiritMult_), a1Stacks))
)

const a4BuffMult = sum(
  1,
  cmpGE(constellation, 4, dm.constellation4.additionalBuffMult)
)
const a4Radiance_atk_ = cmpGE(
  ascension,
  4,
  cmpGE(
    radianceSs,
    1,
    prod(
      percent(dm.passive2.atk_),
      sum(team.common.count.anemo, team.common.count.cryo),
      a4BuffMult
    )
  )
)
const a4Radiance_eleMas = cmpGE(
  ascension,
  4,
  cmpGE(
    radianceSs,
    1,
    prod(
      dm.passive2.eleMas,
      sum(
        team.common.count.pyro,
        team.common.count.hydro,
        team.common.count.electro,
        team.common.count.dendro,
        team.common.count.geo
      ),
      a4BuffMult
    )
  )
)

const c1Armed_stellarswirl_dmg_ = cmpGE(
  constellation,
  1,
  skillArmed.ifOn(percent(dm.constellation1.stellarswirl_dmg_))
)

const c2Stacks_atk_ = cmpGE(
  constellation,
  2,
  cmpGE(a1Stacks, dm.passive1.maxStacks, percent(dm.constellation2.atk_))
)

const c6_stellarswirl_specialDmg_ = cmpGE(
  constellation,
  6,
  percent(dm.constellation6.stellarswirl_specialDmg_)
)

function spiritHit(
  name: string,
  table: number[],
  move: 'skill' | 'burst',
  stellar: boolean
) {
  const cond = stellar ? ssOn : unsetOn
  return dmg(name, info, 'atk', table, move, {
    ele: 'anemo',
    cond,
    baseMulti: a1Stacks_spiritMult_,
  })
}

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 (burst); C5 (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk_.add(a4Radiance_atk_),
  ownBuff.premod.eleMas.add(a4Radiance_eleMas),
  ownBuff.premod.dmg_.stellarswirl.add(c1Armed_stellarswirl_dmg_),
  ownBuff.premod.dmg_.stellarswirl.add(c6_stellarswirl_specialDmg_),
  ownBuff.premod.atk_.add(c2Stacks_atk_),
  // WR infusion.nonOverridableSelf anemo
  ownBuff.reaction.infusionIndex.add(
    skillArmed.ifOn(infusionPrio.nonOverridable.anemo)
  ),
  // A0 Stellar Jubilee — WR teamBuff stellarswirl_baseDmg_
  teamBuff.premod.dmg_.stellarswirl.add(a0_stellarswirl_baseDmg_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_skillDmg', info, 'atk', dm.skill.skillDmg, 'skill'),
  dmg('skill_sword1Dmg', info, 'atk', dm.skill.sword1Dmg, 'skill'),
  dmg('skill_sword2Dmg', info, 'atk', dm.skill.sword2Dmg, 'skill'),
  spiritHit('skill_sword2SpiritDmg', dm.skill.sword2SpiritDmg, 'skill', false),
  spiritHit('skill_sword3SpiritDmg', dm.skill.sword3SpiritDmg, 'skill', false),
  spiritHit(
    'skill_sword3SpiritFinalDmg',
    dm.skill.sword3SpiritFinalDmg,
    'skill',
    false
  ),
  // WR stellarTalentDmgNode (stellarswirl / anemo); talent-style listing until trans pipeline exists.
  spiritHit(
    'skill_sword2SpiritStellarswirlDmg',
    dm.skill.sword2SpiritStellarswirlDmg,
    'skill',
    true
  ),
  spiritHit(
    'skill_sword3SpiritStellarswirlDmg',
    dm.skill.sword3SpiritStellarswirlDmg,
    'skill',
    true
  ),
  spiritHit(
    'skill_sword3SpiritFinalStellarswirlDmg',
    dm.skill.sword3SpiritFinalStellarswirlDmg,
    'skill',
    true
  ),
  dmg('skill_windPinionDmg', info, 'atk', dm.skill.windPinionDmg, 'skill'),
  spiritHit('burst_spiritDmg', dm.burst.spiritDmg, 'burst', false),
  spiritHit(
    'burst_spiritStellarswirlDmg',
    dm.burst.spiritStellarswirlDmg,
    'burst',
    true
  ),
  customDmg(
    'constellation6_transposeDmg',
    info.ele,
    'elemental',
    prod(percent(dm.constellation6.transposeDmg), final.atk),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  ),
  customDmg(
    'constellation6_swordDmg',
    info.ele,
    'elemental',
    prod(percent(dm.constellation6.spiritDmg), final.atk, a1Stacks_spiritMult_),
    { cond: cmpGE(constellation, 6, unsetOn, '') }
  ),
  customDmg(
    'constellation6_swordStellarswirlDmg',
    'anemo',
    'elemental',
    prod(percent(dm.constellation6.spiritDmg), final.atk, a1Stacks_spiritMult_),
    { cond: cmpGE(constellation, 6, ssOn, '') }
  ),

  customParam('a1Stacks_spiritMult_', a1Stacks_spiritMult_, {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customParam('a4Radiance_atk_', a4Radiance_atk_, {
    cond: cmpGE(ascension, 4, ssOn, ''),
  }),
  customParam('a4Radiance_eleMas', a4Radiance_eleMas, {
    cond: cmpGE(ascension, 4, ssOn, ''),
  }),
  customParam('a0_stellarswirl_baseDmg_', a0_stellarswirl_baseDmg_),
  customParam('c1Armed_stellarswirl_dmg_', c1Armed_stellarswirl_dmg_, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customParam('c2Stacks_atk_', c2Stacks_atk_, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('c6_stellarswirl_specialDmg_', c6_stellarswirl_specialDmg_, {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),
  customParam('charged_stam', dm.charged.stam),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)

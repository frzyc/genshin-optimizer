import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allElementWithPhyKeys } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customHeal,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, shield } from './util'

const key: CharacterKey = 'Zhongli'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  p1 = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    stele: skillParam_gen.skill[s++],
    resonance: skillParam_gen.skill[s++],
    pressCD: skillParam_gen.skill[s++][0],
    holdDMG: skillParam_gen.skill[s++],
    shield: skillParam_gen.skill[s++],
    shield_: skillParam_gen.skill[s++],
    shileDuration: skillParam_gen.skill[s++][0],
    holdCD: skillParam_gen.skill[s++][0],
    enemyRes_: -0.2,
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    shield_: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    auto_: skillParam_gen.passive2[p2++][0],
    skill_: skillParam_gen.passive2[p2++][0],
    burst_: skillParam_gen.passive2[p2++][0],
  },
  constellation4: {
    durationInc: skillParam_gen.constellation4[1],
  },
  constellation6: {
    hp_: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'skill' | 'p1')
const { skill } = allBoolConditionals(info.key)
const { p1: p1Stacks } = allNumConditionals(info.key, true, 0, 5)

const skill_enemyRes_ = skill.ifOn(percent(dm.skill.enemyRes_))
const p1_shield_ = cmpGE(
  ascension,
  1,
  prod(p1Stacks, percent(dm.passive1.shield_))
)
// WR premod.*_dmgInc from premod.hp (TODO total). Read premod.hp@agg so formula.base cannot cycle.
const p4AutoDmgInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.auto_), own.premod.hp.sheet('agg'))
)
const p4SkillDmgInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.skill_), own.premod.hp.sheet('agg'))
)
const p4BurstDmgInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.burst_), own.premod.hp.sheet('agg'))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Dominus Lapidis (skill); C5 Planet Befall (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // WR teamBuff.premod.<ele>_enemyRes_ (attacker tag); Pando enemy preRes. Keep WR sign.
  allElementWithPhyKeys.map((ele) =>
    enemyDebuff.common.preRes[ele].add(skill_enemyRes_)
  ),
  // WR teamBuff.premod.shield_ (whole-party, not dest-gated)
  teamBuff.premod.shield_.add(p1_shield_),
  ownBuff.formula.base.normal.add(p4AutoDmgInc),
  ownBuff.formula.base.charged.add(p4AutoDmgInc),
  ownBuff.formula.base.plunging.add(p4AutoDmgInc),
  ownBuff.formula.base.skill.add(p4SkillDmgInc),
  ownBuff.formula.base.burst.add(p4BurstDmgInc),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_stele', info, 'atk', dm.skill.stele, 'skill'),
  dmg('skill_resonance', info, 'atk', dm.skill.resonance, 'skill'),
  dmg('skill_holdDMG', info, 'atk', dm.skill.holdDMG, 'skill'),
  shield('skill_shield', 'hp', dm.skill.shield_, dm.skill.shield, 'skill', {
    ele: 'geo',
  }),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  customHeal('c6_heal', prod(percent(dm.constellation6.hp_), final.hp), {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),

  customParam('p4normalDmgInc', p4AutoDmgInc, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('p4ChargedDmgInc', p4AutoDmgInc, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('p4PlungingDmgInc', p4AutoDmgInc, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('p4SKillDmgInc', p4SkillDmgInc, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('p4BurstDmgInc', p4BurstDmgInc, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  })
)

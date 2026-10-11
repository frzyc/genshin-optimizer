import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
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
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const _key: CharacterKey = 'TravelerDendro'
const data_gen = allStats.char.data['Traveler']
// TODO: Fix gender 🏳
const skillParam_gen = allStats.char.skillParam['TravelerDendroF']

let s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0],
      skillParam_gen.auto[1],
      skillParam_gen.auto[2],
      skillParam_gen.auto[3],
      skillParam_gen.auto[4],
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[5],
    dmg2: skillParam_gen.auto[6],
    stamina: skillParam_gen.auto[7][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[8],
    low: skillParam_gen.auto[9],
    high: skillParam_gen.auto[10],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    lampDmg: skillParam_gen.burst[b++],
    explosionDmg: skillParam_gen.burst[b++],
    unknown1: skillParam_gen.burst[b++],
    unknown2: skillParam_gen.burst[b++],
    lampDuration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    eleMas: skillParam_gen.passive1[0][0],
    maxStacks: 10,
  },
  passive2: {
    skill_dmgInc: skillParam_gen.passive2[0][0],
    burst_dmgInc: skillParam_gen.passive2[1][0],
  },
  lockedPassive: {
    anemo: skillParam_gen.lockedPassive![0][0],
    geo: skillParam_gen.lockedPassive![1][0],
    electro: skillParam_gen.lockedPassive![2][0],
    dendro: skillParam_gen.lockedPassive![3][0],
    hydro: skillParam_gen.lockedPassive![4][0],
    pyro: skillParam_gen.lockedPassive![5][0],
    cryo: skillParam_gen.lockedPassive![6][0],
    charged_dmgInc: skillParam_gen.lockedPassive![7][0],
    cd: skillParam_gen.lockedPassive![8][0],
    delay1: skillParam_gen.lockedPassive![9][0],
    dmg: skillParam_gen.lockedPassive![10][0],
    delay2: skillParam_gen.lockedPassive![11][0],
    onehundred: skillParam_gen.lockedPassive![12][0],
  },
  constellation1: {
    energyRegen: 1,
  },
  constellation2: {
    durationInc: skillParam_gen.constellation2[0],
  },
  constellation6: {
    ele_dmg_: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen, 'dendro')
const {
  final,
  char: { ascension, constellation },
} = own
// WR c6BurstEffect on TravelerDendro; lockedPassive + bonusCanned/Skirk* are
// WR cond('Traveler', …) registered on this key. Num a1Stacks 1..10; list c6BurstEle.
const {
  c6BurstEffect,
  lockedPassive,
  bonusCanned,
  bonusSkirk1,
  bonusSkirk2,
  bonusSkirk3,
} = allBoolConditionals(info.key)
const { a1Stacks } = allNumConditionals(
  info.key,
  true,
  1,
  dm.passive1.maxStacks
)
const { c6BurstEle } = allListConditionals(info.key, [
  'hydro',
  'pyro',
  'electro',
])
// WR cond('Traveler', traveler{ele}) auto-set in wr/api.ts
const {
  traveleranemo,
  travelergeo,
  travelerelectro,
  travelerdendro,
  travelerhydro,
  travelerpyro,
  travelercryo,
} = allBoolConditionals('Traveler')

const lockOn = cmpGE(lockedPassive.ifOn(1), 1, 'infer', '')
const lockedPassive_charged_dmgInc = lockedPassive.ifOn(
  prod(percent(dm.lockedPassive.charged_dmgInc), final.atk)
)
// WR teamBuff.premod.eleMas dest-gated to active (includes self).
const a1_eleMas = prod(
  destIsActive,
  cmpGE(ascension, 1, prod(a1Stacks, dm.passive1.eleMas))
)
const a4_skill_dmg_ = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.skill_dmgInc), own.premod.eleMas.sheet('agg'))
)
const a4_burst_dmg_ = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.burst_dmgInc), own.premod.eleMas.sheet('agg'))
)
const c6_ele_dmg_ = c6BurstEffect.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.ele_dmg_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Razorgrass Blade (skill); C5 Surgent Manifestation (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.base.atk.add(bonusCanned.ifOn(3)),
  ownBuff.base.atk.add(bonusSkirk1.ifOn(7)),
  ownBuff.premod.eleMas.add(bonusSkirk2.ifOn(15)),
  ownBuff.base.hp.add(bonusSkirk3.ifOn(50)),
  ownBuff.premod.critRate_.add(
    lockedPassive.ifOn(traveleranemo.ifOn(percent(dm.lockedPassive.anemo)))
  ),
  ownBuff.premod.def_.add(
    lockedPassive.ifOn(travelergeo.ifOn(percent(dm.lockedPassive.geo)))
  ),
  ownBuff.premod.enerRech_.add(
    lockedPassive.ifOn(travelerelectro.ifOn(percent(dm.lockedPassive.electro)))
  ),
  ownBuff.premod.eleMas.add(
    lockedPassive.ifOn(travelerdendro.ifOn(dm.lockedPassive.dendro))
  ),
  ownBuff.premod.hp_.add(
    lockedPassive.ifOn(travelerhydro.ifOn(percent(dm.lockedPassive.hydro)))
  ),
  ownBuff.premod.atk_.add(
    lockedPassive.ifOn(travelerpyro.ifOn(percent(dm.lockedPassive.pyro)))
  ),
  ownBuff.premod.critDMG_.add(
    lockedPassive.ifOn(travelercryo.ifOn(percent(dm.lockedPassive.cryo)))
  ),
  ownBuff.premod.dmg_.skill.add(a4_skill_dmg_),
  ownBuff.premod.dmg_.burst.add(a4_burst_dmg_),
  teamBuff.premod.eleMas.add(a1_eleMas),
  // WR teamBuff dendro_dmg_ / absorbed ele dest-gated to active.
  teamBuff.premod.dmg_.dendro.add(cmpNE(destIsActive, 0, c6_ele_dmg_)),
  teamBuff.premod.dmg_.hydro.add(
    cmpNE(
      destIsActive,
      0,
      prod(c6BurstEle.map({ hydro: 1, pyro: 0, electro: 0 }), c6_ele_dmg_)
    )
  ),
  teamBuff.premod.dmg_.pyro.add(
    cmpNE(
      destIsActive,
      0,
      prod(c6BurstEle.map({ hydro: 0, pyro: 1, electro: 0 }), c6_ele_dmg_)
    )
  ),
  teamBuff.premod.dmg_.electro.add(
    cmpNE(
      destIsActive,
      0,
      prod(c6BurstEle.map({ hydro: 0, pyro: 0, electro: 1 }), c6_ele_dmg_)
    )
  ),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_2', info, 'atk', dm.charged.dmg2, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst_lamp', info, 'atk', dm.burst.lampDmg, 'burst'),
  dmg('burst_explosion', info, 'atk', dm.burst.explosionDmg, 'burst'),
  dmg(
    'lockedPassive_dmg1',
    info,
    'atk',
    dm.charged.dmg1,
    'charged',
    { ele: 'dendro', cond: lockOn },
    ownBuff.formula.base.charged.add(lockedPassive_charged_dmgInc)
  ),
  dmg(
    'lockedPassive_dmg2',
    info,
    'atk',
    dm.charged.dmg2,
    'charged',
    { ele: 'dendro', cond: lockOn },
    ownBuff.formula.base.charged.add(lockedPassive_charged_dmgInc)
  ),
  customDmg(
    'lockedPassive_vinecore',
    'dendro',
    'charged',
    prod(percent(dm.lockedPassive.dmg), final.atk),
    { cond: lockOn },
    ownBuff.formula.base.charged.add(lockedPassive_charged_dmgInc)
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_lampDuration', dm.burst.lampDuration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)

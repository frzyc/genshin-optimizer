import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  customDmg,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'TravelerGeo'
const data_gen = allStats.char.data['Traveler']
// TODO: Fix gender 🏳
const skillParam_gen = allStats.char.skillParam['TravelerGeoF']

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
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    numShockwaves: 4,
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    skill_cdRed: 2,
  },
  passive2: {
    geoDmg: 0.6,
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
    shield_: skillParam_gen.lockedPassive![9][0],
    duration: skillParam_gen.lockedPassive![10][0],
    one: skillParam_gen.lockedPassive![11][0],
  },
  constellation1: {
    critRate_: 0.1,
  },
  constellation4: {
    energyRestore: 5,
    maxTriggers: 5,
  },
  constellation6: {
    burstDuration: 5,
    skillDuration: 10,
  },
} as const

const info = dataGenToCharInfo(data_gen, 'geo')
const {
  final,
  char: { constellation },
} = own
// WR geoC1BurstArea / lockedPassiveHit on TravelerGeo; lockedPassive +
// bonusCanned/Skirk* are WR cond('Traveler', …) registered on this key.
const {
  geoC1BurstArea,
  lockedPassiveHit,
  lockedPassive,
  bonusCanned,
  bonusSkirk1,
  bonusSkirk2,
  bonusSkirk3,
} = allBoolConditionals(info.key)
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
// WR equal(activeCharKey, target.charKey, …) — dest-gated burst field.
const c1BurstArea_critRate_ = prod(
  destIsActive,
  cmpGE(
    constellation,
    1,
    geoC1BurstArea.ifOn(percent(dm.constellation1.critRate_))
  )
)
const lockedPassiveHit_shield_ = lockedPassive.ifOn(
  lockedPassiveHit.ifOn(percent(dm.lockedPassive.shield_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Wake of Earth (burst); C5 Starfell Sword (skill) — WR skillBoost C5, burstBoost C3
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

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
  teamBuff.premod.critRate_.add(c1BurstArea_critRate_),
  teamBuff.premod.shield_.add(lockedPassiveHit_shield_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_2', info, 'atk', dm.charged.dmg2, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  customDmg(
    'a4',
    'geo',
    'elemental',
    prod(final.atk, percent(dm.passive2.geoDmg))
  ),
  dmg('c2', info, 'atk', dm.skill.dmg, 'skill', {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  dmg(
    'lockedPassive_dmg1',
    info,
    'atk',
    dm.charged.dmg1,
    'charged',
    { ele: 'geo', cond: lockOn },
    ownBuff.formula.base.charged.add(lockedPassive_charged_dmgInc)
  ),
  dmg(
    'lockedPassive_dmg2',
    info,
    'atk',
    dm.charged.dmg2,
    'charged',
    { ele: 'geo', cond: lockOn },
    ownBuff.formula.base.charged.add(lockedPassive_charged_dmgInc)
  )
)

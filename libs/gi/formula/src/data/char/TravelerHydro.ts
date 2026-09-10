import { objKeyMap } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  customHeal,
  customParam,
  customShield,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'TravelerHydro'
const data_gen = allStats.char.data['Traveler']
// TODO: Fix gender 🏳
const skillParam_gen = allStats.char.skillParam['TravelerHydroF']

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
    dewdropDmg: skillParam_gen.skill[s++],
    surgeDmg: skillParam_gen.skill[s++],
    thornDmg: skillParam_gen.skill[s++],
    thornInterval: skillParam_gen.skill[s++][0],
    hpCost: skillParam_gen.skill[s++][0],
    dmgBonus: skillParam_gen.skill[s++],
    suffusionLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    holdDuration: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    numDropsPerSec: skillParam_gen.passive1[0][0],
    maxDrops: skillParam_gen.passive1[1][0],
    heal: skillParam_gen.passive1[2][0],
  },
  passive2: {
    surge_dmgInc: skillParam_gen.passive2[0][0],
    maxSurge_dmgInc: skillParam_gen.passive2[1][0],
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
    stackCd: skillParam_gen.lockedPassive![9][0],
    hpThresh: skillParam_gen.lockedPassive![10][0],
    heal: skillParam_gen.lockedPassive![11][0],
    hpConsume: skillParam_gen.lockedPassive![12][0],
    charged_dmgIncMore: skillParam_gen.lockedPassive![13][0],
    hpIncDec: skillParam_gen.lockedPassive![14][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
  },
  constellation2: {
    movementSpdDec: skillParam_gen.constellation2[0],
    durationInc: skillParam_gen.constellation2[1],
  },
  constellation4: {
    shield_: skillParam_gen.constellation4[0],
    restoreInterval: skillParam_gen.constellation4[1],
    restore_: 0.1,
  },
  constellation6: {
    heal: skillParam_gen.constellation6[0],
  },
} as const

const a4HpConsumedPercentKeys = [
  dm.skill.hpCost,
  2 * dm.skill.hpCost,
  3 * dm.skill.hpCost,
  4 * dm.skill.hpCost,
  5 * dm.skill.hpCost,
  6 * dm.skill.hpCost,
].map(String)

const info = dataGenToCharInfo(data_gen, 'hydro')
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR suffusion / lockedPassiveHp / a4HpConsumedPercent on TravelerHydro;
// lockedPassive + bonusCanned/Skirk* are WR cond('Traveler', …) registered on this key.
const {
  suffusion,
  lockedPassiveHp,
  lockedPassive,
  bonusCanned,
  bonusSkirk1,
  bonusSkirk2,
  bonusSkirk3,
} = allBoolConditionals(info.key)
// WR lookup(cond(key, 'a4HpConsumedPercent'), hpCost..6*hpCost)
const { a4HpConsumedPercent } = allListConditionals(info.key, [
  ...a4HpConsumedPercentKeys,
])
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
const a4HpConsumedPercentVal = a4HpConsumedPercent.map(
  objKeyMap(a4HpConsumedPercentKeys, (k) => Number(k))
)
const suffusion_dewdrop_dmgInc = suffusion.ifOn(
  prod(percent(talentSubscript(skill, dm.skill.dmgBonus)), final.hp)
)
const a4HpConsumed_surge_dmgInc = cmpGE(
  ascension,
  4,
  min(
    dm.passive2.maxSurge_dmgInc,
    prod(
      percent(dm.passive2.surge_dmgInc),
      prod(final.hp, percent(a4HpConsumedPercentVal))
    )
  )
)
const lockedPassive_charged_dmgInc = lockedPassive.ifOn(
  prod(percent(dm.lockedPassive.charged_dmgInc), final.atk)
)
const lockedPassiveHp_charged_dmgInc = lockedPassive.ifOn(
  lockedPassiveHp.ifOn(
    prod(percent(dm.lockedPassive.charged_dmgIncMore), final.atk)
  )
)
const c4Shield = prod(percent(dm.constellation4.shield_), final.hp)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Aquacrest Saber (skill); C5 Rising Waters (burst) — WR skillBoost C3, burstBoost C5
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

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_2', info, 'atk', dm.charged.dmg2, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg(
    'skill_surge',
    info,
    'atk',
    dm.skill.surgeDmg,
    'skill',
    undefined,
    ownBuff.formula.base.add(a4HpConsumed_surge_dmgInc)
  ),
  dmg(
    'skill_dewdrop',
    info,
    'atk',
    dm.skill.dewdropDmg,
    'skill',
    undefined,
    ownBuff.formula.base.add(suffusion_dewdrop_dmgInc)
  ),
  // WR thornDmg sets hit.reaction to '' (Arkhe); Pando has no no-react overlay.
  dmg('skill_thorn', info, 'atk', dm.skill.thornDmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  customHeal('a1_heal', prod(percent(dm.passive1.heal), final.hp), {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  dmg(
    'lockedPassive_dmg1',
    info,
    'atk',
    dm.charged.dmg1,
    'charged',
    { ele: 'hydro', cond: lockOn },
    ownBuff.formula.base.add(lockedPassive_charged_dmgInc),
    ownBuff.formula.base.add(lockedPassiveHp_charged_dmgInc)
  ),
  dmg(
    'lockedPassive_dmg2',
    info,
    'atk',
    dm.charged.dmg2,
    'charged',
    { ele: 'hydro', cond: lockOn },
    ownBuff.formula.base.add(lockedPassive_charged_dmgInc),
    ownBuff.formula.base.add(lockedPassiveHp_charged_dmgInc)
  ),
  customHeal(
    'lockedPassive_heal',
    prod(percent(dm.lockedPassive.heal), final.hp)
  ),
  customShield('c4_shield', undefined, c4Shield, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customShield('c4_hydroShield', 'hydro', c4Shield, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customHeal('c6_heal', prod(percent(dm.constellation6.heal), final.hp), {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),
  customParam('suffusion_hpCost', prod(percent(dm.skill.hpCost), final.hp))
)

import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import { infusionPrio } from '../common/dmg'
import {
  allBoolConditionals,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'TravelerPyro'
const data_gen = allStats.char.data['Traveler']
// TODO: Fix gender 🏳
const skillParam_gen = allStats.char.skillParam['TravelerPyroF']

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
    blazingDmg: skillParam_gen.skill[s++],
    scorchingInstantDmg: skillParam_gen.skill[s++],
    scorchingDmg: skillParam_gen.skill[s++],
    nsLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
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
  },
  // TODO
  constellation1: {
    dmg_: 0.06, // skillParam_gen.constellation1[0],
    ns_dmg_: 0.09, // skillParam_gen.constellation1[1],
  },
  constellation4: {
    pyro_dmg_: 0.2, //skillParam_gen.constellation4[0],
    duration: 9, //skillParam_gen.constellation4[1],
  },
  constellation6: {
    crit_dmg_: 0.4, //skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen, 'pyro')
const {
  final,
  char: { constellation },
} = own
// WR cond('TravelerPyro', 'c1SkillActive' | 'c1Ns' | 'c4AfterBurst' | 'c6InNs')
// WR cond('Traveler', 'lockedPassive' | 'bonusCanned' | 'bonusSkirk*') — Pando sheet TravelerPyro.
const {
  c1SkillActive,
  c1Ns,
  c4AfterBurst,
  c6InNs,
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
const c1SkillActive_all_dmg_ = c1SkillActive.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.dmg_))
)
const c1Ns_all_dmg_ = c1SkillActive.ifOn(
  c1Ns.ifOn(cmpGE(constellation, 1, percent(dm.constellation1.ns_dmg_)))
)
const c4AfterBurst_pyro_dmg_ = c4AfterBurst.ifOn(
  cmpGE(constellation, 4, percent(dm.constellation4.pyro_dmg_))
)
const c6InNs_critDMG_ = c6InNs.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.crit_dmg_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Relayed Beacon (skill); C5 The Fire Inextinguishable (burst)
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

  // WR teamBuff.premod.all_dmg_ dest-gated to active.
  teamBuff.premod.dmg_.add(
    cmpNE(destIsActive, 0, sum(c1SkillActive_all_dmg_, c1Ns_all_dmg_))
  ),
  ownBuff.premod.dmg_.pyro.add(c4AfterBurst_pyro_dmg_),
  // WR infusion.nonOverridableSelf pyro. Kit: cannot be overridden.
  ownBuff.reaction.infusionIndex.add(
    cmpGE(constellation, 6, c6InNs.ifOn(infusionPrio.nonOverridable.pyro))
  ),
  ownBuff.premod.critDMG_.normal.add(c6InNs_critDMG_),
  ownBuff.premod.critDMG_.charged.add(c6InNs_critDMG_),
  ownBuff.premod.critDMG_.plunging.add(c6InNs_critDMG_),

  // Formulas — sword NA/CA/plunge physical. Skill/burst infer pyro from info.ele.
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_2', info, 'atk', dm.charged.dmg2, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_blazingDmg', info, 'atk', dm.skill.blazingDmg, 'skill'),
  dmg(
    'skill_scorchingInstantDmg',
    info,
    'atk',
    dm.skill.scorchingInstantDmg,
    'skill'
  ),
  dmg('skill_scorchingDmg', info, 'atk', dm.skill.scorchingDmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  // WR hitEle.pyro + listing-local charged_dmgInc on Inferno CA.
  dmg(
    'lockedPassive_dmg1',
    info,
    'atk',
    dm.charged.dmg1,
    'charged',
    { ele: 'pyro', cond: lockOn },
    ownBuff.formula.base.charged.add(lockedPassive_charged_dmgInc)
  ),
  dmg(
    'lockedPassive_dmg2',
    info,
    'atk',
    dm.charged.dmg2,
    'charged',
    { ele: 'pyro', cond: lockOn },
    ownBuff.formula.base.charged.add(lockedPassive_charged_dmgInc)
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_nsLimit', dm.skill.nsLimit),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('lockedPassive_cd', dm.lockedPassive.cd, { cond: lockOn })
)

import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  customDmg,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'TravelerElectro'
const data_gen = allStats.char.data['Traveler']
// TODO: Fix gender 🏳
const skillParam_gen = allStats.char.skillParam['TravelerElectroF']

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
    energyRestore: skillParam_gen.skill[s++],
    amulets: 2,
    amuletDuration: skillParam_gen.skill[s++][0],
    enerRech_: skillParam_gen.skill[s++][0],
    enerRech_duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    pressDmg: skillParam_gen.burst[b++],
    thunderDmg: skillParam_gen.burst[b++],
    thunderCd: 0.5,
    energyRestore: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cdRed: skillParam_gen.passive1[0][0],
  },
  passive2: {
    enerRech_: skillParam_gen.passive2[0][0],
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
    delay: skillParam_gen.lockedPassive![9][0],
    dmg: skillParam_gen.lockedPassive![10][0],
  },
  constellation1: {
    addlAmulets: 1,
  },
  constellation2: {
    duration: skillParam_gen.constellation2[0],
    electro_enemyRes: skillParam_gen.constellation2[1],
  },
  constellation6: {
    numAttacks: skillParam_gen.constellation6[0],
    thunder_dmg_: skillParam_gen.constellation6[0],
    energyRestore: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen, 'electro')
const {
  final,
  char: { burst, ascension, constellation },
} = own
// WR electroSkillAmulet / electroC2Thunder on TravelerElectro; lockedPassive +
// bonusCanned/Skirk* are WR cond('Traveler', …) registered on this key.
const {
  electroSkillAmulet,
  electroC2Thunder,
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
// WR A4: prod(premod.enerRech_, percent) into amulet ER; write total to avoid loops.
const a4_enerRech_ = cmpGE(
  ascension,
  4,
  prod(own.premod.enerRech_.sheet('agg'), percent(dm.passive2.enerRech_))
)
const skillAmulet_enerRech_ = prod(
  destIsActive,
  electroSkillAmulet.ifOn(sum(percent(dm.skill.enerRech_), a4_enerRech_))
)
const c2Thunder_electro_enemyRes_ = electroC2Thunder.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.electro_enemyRes))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Distant Crackling (burst); C5 Clamor in the Wilds (skill) — WR skillBoost C5, burstBoost C3
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
  // WR teamBuff.total.enerRech_ dest-gated to active (includes self).
  teamBuff.final.enerRech_.add(skillAmulet_enerRech_),
  // WR teamBuff.premod.electro_enemyRes_; keep sign.
  enemyDebuff.common.preRes.electro.add(c2Thunder_electro_enemyRes_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_2', info, 'atk', dm.charged.dmg2, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst_press', info, 'atk', dm.burst.pressDmg, 'burst'),
  dmg('burst_thunder', info, 'atk', dm.burst.thunderDmg, 'burst'),
  customDmg(
    'burst_thirdThunder',
    info.ele,
    'burst',
    prod(
      percent(talentSubscript(burst, dm.burst.thunderDmg)),
      percent(dm.constellation6.thunder_dmg_),
      final.atk
    ),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  ),
  dmg(
    'lockedPassive_dmg1',
    info,
    'atk',
    dm.charged.dmg1,
    'charged',
    { ele: 'electro', cond: lockOn },
    ownBuff.formula.base.charged.add(lockedPassive_charged_dmgInc)
  ),
  dmg(
    'lockedPassive_dmg2',
    info,
    'atk',
    dm.charged.dmg2,
    'charged',
    { ele: 'electro', cond: lockOn },
    ownBuff.formula.base.charged.add(lockedPassive_charged_dmgInc)
  ),
  customDmg(
    'lockedPassive_lightning',
    'electro',
    'charged',
    prod(percent(dm.lockedPassive.dmg), final.atk),
    { cond: lockOn },
    ownBuff.formula.base.charged.add(lockedPassive_charged_dmgInc)
  )
)

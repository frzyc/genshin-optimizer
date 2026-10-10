import { absorbableEle } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  customDmg,
  customHeal,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const data_gen = allStats.char.data['Traveler']
// TODO: Fix gender 🏳
const skillParam_gen = allStats.char.skillParam['TravelerAnemoF']

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
    initial_dmg: skillParam_gen.skill[s++],
    initial_max: skillParam_gen.skill[s++],
    ele_dmg: 0.25,
    storm_dmg: skillParam_gen.skill[s++],
    storm_max: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    maxCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    absorbDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg: 0.6,
  },
  passive2: {
    heal_: 0.02,
  },
  lockedPassive: {
    anemo: skillParam_gen.lockedPassive![0][0],
    charged_dmgInc: skillParam_gen.lockedPassive![7][0],
    cd: skillParam_gen.lockedPassive![8][0],
    dmg: skillParam_gen.lockedPassive![9][0],
  },
  constellation2: {
    enerRech_: 0.16,
  },
  constellation6: {
    enemyRes_: -0.2,
  },
} as const

const info = dataGenToCharInfo(data_gen, 'anemo')
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond('TravelerAnemo', 'skillAbsorption' | 'anemoBurstAbsorption' | 'anemoC6Hit')
// WR cond('Traveler', 'lockedPassive' | 'bonusCanned' | 'bonusSkirk*') — Pando sheet TravelerAnemo.
// traveleranemo is auto-set in wr/api.ts; this sheet applies anemo critRate_ on lockedPassive.
const {
  anemoC6Hit,
  lockedPassive,
  bonusCanned,
  bonusSkirk1,
  bonusSkirk2,
  bonusSkirk3,
} = allBoolConditionals(info.key)
const { skillAbsorption, anemoBurstAbsorption } = allListConditionals(
  info.key,
  [...absorbableEle]
)

function absorbOn(
  absorption: typeof skillAbsorption,
  ele: (typeof absorbableEle)[number]
) {
  return cmpGE(
    absorption.map({
      hydro: ele === 'hydro' ? 1 : 0,
      pyro: ele === 'pyro' ? 1 : 0,
      cryo: ele === 'cryo' ? 1 : 0,
      electro: ele === 'electro' ? 1 : 0,
    }),
    1,
    'infer',
    ''
  )
}

const lockOn = cmpGE(lockedPassive.ifOn(1), 1, 'infer', '')
const lockedPassive_charged_dmgInc = lockedPassive.ifOn(
  prod(percent(dm.lockedPassive.charged_dmgInc), final.atk)
)
const c6On = prod(anemoC6Hit.ifOn(1), cmpGE(constellation, 6, 1))

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Gust Surge (burst); C5 Palm Vortex (skill) — WR skillBoost C5, burstBoost C3
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.base.atk.add(bonusCanned.ifOn(3)),
  ownBuff.base.atk.add(bonusSkirk1.ifOn(7)),
  ownBuff.premod.eleMas.add(bonusSkirk2.ifOn(15)),
  ownBuff.base.hp.add(bonusSkirk3.ifOn(50)),
  ownBuff.premod.critRate_.add(
    lockedPassive.ifOn(percent(dm.lockedPassive.anemo))
  ),
  ownBuff.premod.enerRech_.add(
    cmpGE(constellation, 2, percent(dm.constellation2.enerRech_))
  ),
  enemyDebuff.common.preRes.anemo.add(prod(c6On, dm.constellation6.enemyRes_)),
  absorbableEle.map((ele) =>
    enemyDebuff.common.preRes[ele].add(
      prod(
        c6On,
        anemoBurstAbsorption.map({
          hydro: ele === 'hydro' ? 1 : 0,
          pyro: ele === 'pyro' ? 1 : 0,
          cryo: ele === 'cryo' ? 1 : 0,
          electro: ele === 'electro' ? 1 : 0,
        }),
        dm.constellation6.enemyRes_
      )
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
  dmg('skill_initial_dmg', info, 'atk', dm.skill.initial_dmg, 'skill'),
  dmg('skill_initial_max', info, 'atk', dm.skill.initial_max, 'skill'),
  dmg('skill_storm_dmg', info, 'atk', dm.skill.storm_dmg, 'skill'),
  dmg('skill_storm_max', info, 'atk', dm.skill.storm_max, 'skill'),
  absorbableEle.flatMap((ele) => [
    ...dmg(
      `skill_initial_ele_${ele}`,
      info,
      'atk',
      dm.skill.initial_dmg,
      'skill',
      {
        ele,
        cond: absorbOn(skillAbsorption, ele),
        baseMulti: percent(dm.skill.ele_dmg),
      }
    ),
    ...dmg(`skill_max_ele_${ele}`, info, 'atk', dm.skill.initial_max, 'skill', {
      ele,
      cond: absorbOn(skillAbsorption, ele),
      baseMulti: percent(dm.skill.ele_dmg),
    }),
    ...dmg(`skill_storm_ele_${ele}`, info, 'atk', dm.skill.storm_dmg, 'skill', {
      ele,
      cond: absorbOn(skillAbsorption, ele),
      baseMulti: percent(dm.skill.ele_dmg),
    }),
    ...dmg(
      `skill_storm_ele_max_${ele}`,
      info,
      'atk',
      dm.skill.storm_max,
      'skill',
      {
        ele,
        cond: absorbOn(skillAbsorption, ele),
        baseMulti: percent(dm.skill.ele_dmg),
      }
    ),
  ]),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  absorbableEle.flatMap((ele) =>
    dmg(`burst_absorb_${ele}`, info, 'atk', dm.burst.absorbDmg, 'burst', {
      ele,
      cond: absorbOn(anemoBurstAbsorption, ele),
    })
  ),
  customDmg(
    'a1',
    'anemo',
    'elemental',
    prod(percent(dm.passive1.dmg), final.atk),
    { cond: cmpGE(ascension, 1, 'infer', '') }
  ),
  customHeal('a2_heal', prod(percent(dm.passive2.heal_), final.hp), {
    cond: cmpGE(ascension, 2, 'infer', ''),
  }),
  dmg(
    'lockedPassive_dmg1',
    info,
    'atk',
    dm.charged.dmg1,
    'charged',
    { ele: 'anemo', cond: lockOn },
    ownBuff.formula.base.add(lockedPassive_charged_dmgInc)
  ),
  dmg(
    'lockedPassive_dmg2',
    info,
    'atk',
    dm.charged.dmg2,
    'charged',
    { ele: 'anemo', cond: lockOn },
    ownBuff.formula.base.add(lockedPassive_charged_dmgInc)
  ),
  absorbableEle.flatMap((ele) =>
    customDmg(
      `lockedPassive_${ele}`,
      ele,
      'charged',
      prod(percent(dm.lockedPassive.dmg), final.atk),
      { cond: lockOn },
      ownBuff.formula.base.add(lockedPassive_charged_dmgInc)
    )
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_cd', dm.skill.cd),
  customParam('skill_maxCd', dm.skill.maxCd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('lockedPassive_cd', dm.lockedPassive.cd, { cond: lockOn })
)

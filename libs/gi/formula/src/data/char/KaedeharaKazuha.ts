import { absorbableEle, type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allListConditionals,
  customDmg,
  customParam,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'KaedeharaKazuha'
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
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5x3
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++],
    dmg2: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    press: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    hold: skillParam_gen.skill[s++],
    cdHold: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    dot: skillParam_gen.burst[b++],
    add: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    absorbAdd: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    elemas_dmg_: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    elemas: skillParam_gen.constellation2[0],
  },
  constellation6: {
    auto_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR condReadNode swirl${ele} equals the element string; c2/c2p/c6 are not `'on'`.
const { swirlpyro } = allListConditionals(info.key, ['pyro'])
const { swirlhydro } = allListConditionals(info.key, ['hydro'])
const { swirlcryo } = allListConditionals(info.key, ['cryo'])
const { swirlelectro } = allListConditionals(info.key, ['electro'])
const { c2 } = allListConditionals(info.key, ['c2'])
const { c2p } = allListConditionals(info.key, ['c2p'])
const { c6 } = allListConditionals(info.key, ['c6'])
const { burstAbsorption, skillAbsorption } = allListConditionals(info.key, [
  ...absorbableEle,
])
const swirlpyroOn = swirlpyro.map({ pyro: 1 })
const swirlhydroOn = swirlhydro.map({ hydro: 1 })
const swirlcryoOn = swirlcryo.map({ cryo: 1 })
const swirlelectroOn = swirlelectro.map({ electro: 1 })
const c2On = c2.map({ c2: 1 })
const c2pOn = c2p.map({ c2p: 1 })
const c6On = c6.map({ c6: 1 })

const swirlByEleOn = {
  pyro: swirlpyroOn,
  hydro: swirlhydroOn,
  cryo: swirlcryoOn,
  electro: swirlelectroOn,
} as const

function absorbOn(
  absorption: typeof burstAbsorption,
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

const c2_eleMas = prod(c2On, cmpGE(constellation, 2, dm.constellation2.elemas))
const c2p_eleMas = prod(
  c2pOn,
  cmpGE(constellation, 2, dm.constellation2.elemas)
)
// WR total.normal/charged/plunging_dmg_ from premod.eleMas.
const c6_auto_dmg_ = prod(
  c6On,
  cmpGE(
    constellation,
    6,
    prod(percent(dm.constellation6.auto_), own.premod.eleMas.sheet('agg'))
  )
)
const c6InfusionOn = cmpGE(
  prod(cmpGE(constellation, 6, 1), c6On),
  1,
  'infer',
  ''
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Maple Monogatari (skill); C5 Wisdom of Bansei (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // WR A4 teamBuff.total[`${ele}_dmg_`] from src premod.eleMas
  absorbableEle.map((ele) =>
    teamBuff.premod.dmg_[ele].add(
      prod(
        swirlByEleOn[ele],
        cmpGE(
          ascension,
          4,
          prod(percent(dm.passive2.elemas_dmg_), own.premod.eleMas.sheet('agg'))
        )
      )
    )
  ),
  // WR premod.eleMas (self). C2P is teamBuff, dest active, dest ≠ Kazuha.
  ownBuff.premod.eleMas.add(c2_eleMas),
  notOwnBuff.premod.eleMas.add(cmpNE(destIsActive, 0, c2p_eleMas)),
  ownBuff.premod.dmg_.normal.add(c6_auto_dmg_),
  ownBuff.premod.dmg_.charged.add(c6_auto_dmg_),
  ownBuff.premod.dmg_.plunging.add(c6_auto_dmg_),

  // WR infusion.overridableSelf anemo. infusionPrio has no anemo channel —
  // listing-local `{ ele: 'anemo' }` on C6 NA/CA/plunge.
  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal'),
    ...dmg(`normal_${i}_anemo`, info, 'atk', arr, 'normal', {
      ele: 'anemo',
      cond: c6InfusionOn,
    }),
  ]),
  dmg('charged_1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_2', info, 'atk', dm.charged.dmg2, 'charged'),
  dmg('charged_1_anemo', info, 'atk', dm.charged.dmg1, 'charged', {
    ele: 'anemo',
    cond: c6InfusionOn,
  }),
  dmg('charged_2_anemo', info, 'atk', dm.charged.dmg2, 'charged', {
    ele: 'anemo',
    cond: c6InfusionOn,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) => [
    ...dmg(`plunging_${k}`, info, 'atk', v, 'plunging'),
    ...dmg(`plunging_${k}_anemo`, info, 'atk', v, 'plunging', {
      ele: 'anemo',
      cond: c6InfusionOn,
    }),
  ]),
  dmg('skill_press', info, 'atk', dm.skill.press, 'skill'),
  dmg('skill_hold', info, 'atk', dm.skill.hold, 'skill'),
  // Chihayaburu Midare Ranzan: same plunge MV, Anemo (WR skill.pdmg/plow/phigh)
  dmg('skill_plunging_dmg', info, 'atk', dm.plunging.dmg, 'plunging', {
    ele: 'anemo',
  }),
  dmg('skill_plunging_low', info, 'atk', dm.plunging.low, 'plunging', {
    ele: 'anemo',
  }),
  dmg('skill_plunging_high', info, 'atk', dm.plunging.high, 'plunging', {
    ele: 'anemo',
  }),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  dmg('burst_dot', info, 'atk', dm.burst.dot, 'burst'),
  absorbableEle.flatMap((ele) =>
    dmg(`burst_absorb_${ele}`, info, 'atk', dm.burst.add, 'burst', {
      ele,
      cond: absorbOn(burstAbsorption, ele),
    })
  ),
  absorbableEle.flatMap((ele) =>
    customDmg(
      `a1_absorb_${ele}`,
      ele,
      'plunging',
      prod(percent(dm.passive1.absorbAdd), final.atk),
      {
        cond: cmpGE(ascension, 1, absorbOn(skillAbsorption, ele), ''),
      }
    )
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_cd', dm.skill.cd),
  customParam('skill_cdHold', dm.skill.cdHold),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('p3_staminaSprintDec_', percent(0.2))
)

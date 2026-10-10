import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allListConditionals,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'KujouSara'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    fullyAimed: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    atkBonus: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    titanBreakerDmg: skillParam_gen.burst[b++],
    stormClusterDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    energyGen: skillParam_gen.passive2[p2++][0],
    er: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    crowfeatherDmg: skillParam_gen.constellation2[0],
  },
  constellation6: {
    atkInc: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'TenguJuuraiAmbush' | 'c6') — states are not `'on'`.
const { TenguJuuraiAmbush } = allListConditionals(info.key, [
  'TenguJuuraiAmbush',
])
const { c6 } = allListConditionals(info.key, ['c6'])

const ambushOn = TenguJuuraiAmbush.map({ TenguJuuraiAmbush: 1 })
const c6On = c6.map({ c6: 1 })
// WR equal(activeCharKey, target.charKey, prod(base.atk, skillRatio)).
const skillTenguAmbush_atk = prod(
  ambushOn,
  own.base.atk,
  percent(talentSubscript(skill, dm.skill.atkBonus))
)
// WR electro_critDMG_ — ambush + c6 only; not dest-gated.
const c6ElectroCritDmg_ = prod(
  ambushOn,
  c6On,
  cmpGE(constellation, 6, percent(dm.constellation6.atkInc))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Subjugation: Koukou Sendou (burst); C5 Tengu Stormcall (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  teamBuff.premod.atk.add(cmpNE(destIsActive, 0, skillTenguAmbush_atk)),
  teamBuff.premod.critDMG_.electro.add(c6ElectroCritDmg_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_aimedCharged', info, 'atk', dm.charged.fullyAimed, 'charged', {
    ele: 'electro',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst_titanbreaker', info, 'atk', dm.burst.titanBreakerDmg, 'burst'),
  dmg('burst_stormcluster', info, 'atk', dm.burst.stormClusterDmg, 'burst'),
  // WR prod(dmgNode(skill), percent(crowfeatherDmg))
  dmg('c2', info, 'atk', dm.skill.dmg, 'skill', {
    baseMulti: percent(dm.constellation2.crowfeatherDmg),
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  // WR infoMut display: 1.2 Energy per 100% ER (total.enerRech_ includes the 1.0 base).
  customParam(
    'a4_energyRegen',
    prod(sum(1, final.enerRech_), dm.passive2.energyGen),
    { cond: cmpGE(ascension, 4, 'infer', '') }
  )
)

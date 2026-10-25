import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, shield } from './util'

const key: CharacterKey = 'Xinyan'
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
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    spin: skillParam_gen.auto[a++],
    final: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    shieldArr: [
      {
        defShield_: skillParam_gen.skill[s++],
        baseShield: skillParam_gen.skill[s++],
      },
      {
        defShield_: skillParam_gen.skill[s++],
        baseShield: skillParam_gen.skill[s++],
      },
      {
        defShield_: skillParam_gen.skill[s++],
        baseShield: skillParam_gen.skill[s++],
      },
    ],
    lvl3Dmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    pressPhysDmg: skillParam_gen.burst[b++],
    dotPyroDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
  },
  passive2: {
    physical_dmg_: skillParam_gen.passive2[0][0],
  },
  c1: {
    atkSPD_: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
    cd: skillParam_gen.constellation1[1],
  },
  c2: {
    burstphysical_critRate_: skillParam_gen.constellation2[0],
  },
  c4: {
    physical_enemyRes_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  c6: {
    staminaChargedDec_: -skillParam_gen.constellation6[0],
    charged_atkBonus: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'p2Shield' | 'c1Crit' | 'c4Burst' | 'c6Charged')
const { p2Shield, c1Crit, c4Burst, c6Charged } = allBoolConditionals(info.key)

const c2BurstPhysical_critRate_ = cmpGE(
  constellation,
  2,
  percent(dm.c2.burstphysical_critRate_)
)
const c6_staminaChargedDec_ = cmpGE(
  constellation,
  6,
  percent(dm.c6.staminaChargedDec_)
)
const c6_chargedAtkBonus = cmpGE(
  constellation,
  6,
  c6Charged.ifOn(prod(final.def, percent(dm.c6.charged_atkBonus)))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Sweeping Fervor (skill); C5 Riff Revolution (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  teamBuff.premod.dmg_.physical.add(
    cmpGE(ascension, 4, p2Shield.ifOn(percent(dm.passive2.physical_dmg_)))
  ),
  ownBuff.premod.atkSPD_.add(
    cmpGE(constellation, 1, c1Crit.ifOn(percent(dm.c1.atkSPD_)))
  ),
  enemyDebuff.common.preRes.physical.add(
    cmpGE(constellation, 4, c4Burst.ifOn(percent(dm.c4.physical_enemyRes_)))
  ),
  ownBuff.premod.staminaChargedDec_.add(c6_staminaChargedDec_),
  ownBuff.premod.atk.add(c6_chargedAtkBonus),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_spinning', info, 'atk', dm.charged.spin, 'charged'),
  dmg('charged_final', info, 'atk', dm.charged.final, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dm.skill.shieldArr.flatMap((data, i) => [
    ...shield(
      `normShield${i + 1}`,
      'def',
      data.defShield_,
      data.baseShield,
      'skill'
    ),
    ...shield(
      `pyroShield${i + 1}`,
      'def',
      data.defShield_,
      data.baseShield,
      'skill',
      { ele: 'pyro' }
    ),
  ]),
  dmg('lvl3Dmg', info, 'atk', dm.skill.lvl3Dmg, 'skill'),
  dmg(
    'pressPhysDmg',
    info,
    'atk',
    dm.burst.pressPhysDmg,
    'burst',
    { ele: 'physical' },
    ownBuff.premod.critRate_.burst.add(c2BurstPhysical_critRate_)
  ),
  dmg('dotPyroDmg', info, 'atk', dm.burst.dotPyroDmg, 'burst')
)

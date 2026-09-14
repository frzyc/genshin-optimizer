import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  customDmg,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Tartaglia'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  p1 = 0
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
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
  },
  riptide: {
    flashDmg: skillParam_gen.auto[a++],
    burstDmg: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  riptideDuration: skillParam_gen.auto[a++][0],
  skill: {
    stanceDmg: skillParam_gen.skill[s++],
    normal1: skillParam_gen.skill[s++],
    normal2: skillParam_gen.skill[s++],
    normal3: skillParam_gen.skill[s++],
    normal4: skillParam_gen.skill[s++],
    normal5: skillParam_gen.skill[s++],
    normal61: skillParam_gen.skill[s++],
    normal62: skillParam_gen.skill[s++],
    charged1: skillParam_gen.skill[s++],
    charged2: skillParam_gen.skill[s++],
    riptideSlash: skillParam_gen.skill[s++],
    chargedStamina: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    preemptiveCd1: skillParam_gen.skill[s++][0],
    preemptiveCd2: skillParam_gen.skill[s++][0],
    maxCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    meleeDmg: skillParam_gen.burst[b++],
    riptideBlastDmg: skillParam_gen.burst[b++],
    rangedDmg: skillParam_gen.burst[b++],
    enerReturned: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    durationExt: skillParam_gen.passive1[p1++][0],
  },
  passive: {
    auto_boost: 1,
  },
  constellation1: {
    cdRed: 0.2,
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, constellation },
} = own

function melee(name: string, table: number[], move: 'normal' | 'charged') {
  return customDmg(
    name,
    'hydro',
    move,
    prod(percent(talentSubscript(skill, table)), final.atk)
  )
}

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Abyssal Mayhem: Vortex of Turmoil (skill); C5 Havoc: Annihilation (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // WR teamBuff.premod.autoBoost
  teamBuff.char.auto.add(dm.passive.auto_boost),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_aimedCharged', info, 'atk', dm.charged.aimedCharged, 'charged', {
    ele: 'hydro',
  }),
  dmg('riptide_flash', info, 'atk', dm.riptide.flashDmg, 'normal', {
    ele: 'hydro',
  }),
  dmg('riptide_burst', info, 'atk', dm.riptide.burstDmg, 'normal', {
    ele: 'hydro',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_stance', info, 'atk', dm.skill.stanceDmg, 'skill'),
  melee('skill_normal1', dm.skill.normal1, 'normal'),
  melee('skill_normal2', dm.skill.normal2, 'normal'),
  melee('skill_normal3', dm.skill.normal3, 'normal'),
  melee('skill_normal4', dm.skill.normal4, 'normal'),
  melee('skill_normal5', dm.skill.normal5, 'normal'),
  melee('skill_normal61', dm.skill.normal61, 'normal'),
  melee('skill_normal62', dm.skill.normal62, 'normal'),
  melee('skill_charged1', dm.skill.charged1, 'charged'),
  melee('skill_charged2', dm.skill.charged2, 'charged'),
  dmg('skill_riptideSlash', info, 'atk', dm.skill.riptideSlash, 'skill'),
  dmg('burst_melee', info, 'atk', dm.burst.meleeDmg, 'burst'),
  dmg('burst_ranged', info, 'atk', dm.burst.rangedDmg, 'burst'),
  dmg('burst_riptideBlast', info, 'atk', dm.burst.riptideBlastDmg, 'burst'),

  customParam('riptideDuration', dm.riptideDuration),
  customParam('skill_chargedStamina', dm.skill.chargedStamina),
  customParam('skill_duration', dm.skill.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)

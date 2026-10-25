import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod } from '@genshin-optimizer/pando/engine'
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
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Xiangling'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4x4
      skillParam_gen.auto[a++], // 5
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++], // 1
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
  },
  burst: {
    dmg1: skillParam_gen.burst[b++],
    dmg2: skillParam_gen.burst[b++],
    dmg3: skillParam_gen.burst[b++],
    dmgNado: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    atk_bonus: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    pyroRes: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
  },
  constellation2: {
    duration1: skillParam_gen.constellation2[0],
    duration2: skillParam_gen.constellation2[1],
    dmg: skillParam_gen.constellation2[2],
  },
  constellation4: {
    durationInc: skillParam_gen.constellation4[0],
  },
  constellation6: {
    pyroDmg: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'afterChili' | 'afterGuobaHit' | 'afterPyronado')
const { afterChili, afterGuobaHit, afterPyronado } = allBoolConditionals(
  info.key
)

const afterChili_atk_ = afterChili.ifOn(
  cmpGE(ascension, 4, percent(dm.passive2.atk_bonus))
)
const afterGuobaHit_pyro_enemyRes_ = afterGuobaHit.ifOn(
  cmpGE(constellation, 1, percent(-dm.constellation1.pyroRes))
)
const afterPyronado_pyro_dmg_ = afterPyronado.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.pyroDmg))
)
// WR antiC6: C6 pyro_dmg_ does not apply to 1/2-hit swings or Pyronado DMG.
const antiC6 = prod(afterPyronado_pyro_dmg_, -1)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Pyronado (burst); C5 Guoba Attack (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  // WR activeCharBuff: chili ATK% on the on-fielder only.
  teamBuff.premod.atk_.add(cmpNE(destIsActive, 0, afterChili_atk_)),
  teamBuff.premod.dmg_.pyro.add(afterPyronado_pyro_dmg_),
  enemyDebuff.common.preRes.pyro.add(afterGuobaHit_pyro_enemyRes_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg1, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.press, 'skill'),
  dmg(
    'burst_dmg1',
    info,
    'atk',
    dm.burst.dmg1,
    'burst',
    undefined,
    ownBuff.premod.dmg_.pyro.add(antiC6)
  ),
  dmg(
    'burst_dmg2',
    info,
    'atk',
    dm.burst.dmg2,
    'burst',
    undefined,
    ownBuff.premod.dmg_.pyro.add(antiC6)
  ),
  dmg('burst_dmg3', info, 'atk', dm.burst.dmg3, 'burst'),
  dmg(
    'burst_dmgNado',
    info,
    'atk',
    dm.burst.dmgNado,
    'burst',
    undefined,
    ownBuff.premod.dmg_.pyro.add(antiC6)
  ),
  customDmg(
    'c2',
    info.ele,
    'elemental',
    prod(final.atk, percent(dm.constellation2.dmg)),
    { cond: cmpGE(constellation, 2, 'infer', '') }
  )
)

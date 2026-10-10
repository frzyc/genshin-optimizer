import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allListConditionals,
  customDmg,
  customParam,
  enemyDebuff,
  hexereiTally,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'YaeMiko'
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
      skillParam_gen.auto[a++], // 3
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg1: skillParam_gen.skill[s++],
    dmg2: skillParam_gen.skill[s++],
    dmg3: skillParam_gen.skill[s++],
    dmg4: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    tenkoDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg: skillParam_gen.passive1[0][0],
    stellarDmg: skillParam_gen.passive1[1][0],
  },
  passive2: {
    eleMas_dmg_: skillParam_gen.passive2[p2++][0],
  },
  lockedPassive: {
    dmgInc: skillParam_gen.lockedPassive![0][0],
    cd: skillParam_gen.lockedPassive![1][0],
    stellarDmg: skillParam_gen.lockedPassive![2][0],
    durationInc: skillParam_gen.lockedPassive![3][0],
  },
  constellation1: {
    enerRest: skillParam_gen.constellation1[0],
    electro_stellarconduct_dmg_: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2],
  },
  constellation2: {
    unknown1: skillParam_gen.constellation2[0],
    aoeInc: skillParam_gen.constellation2[1],
    unknown2: skillParam_gen.constellation2[2],
    eleMas: [
      skillParam_gen.constellation2[3],
      skillParam_gen.constellation2[4],
      skillParam_gen.constellation2[5],
      skillParam_gen.constellation2[6],
    ],
  },
  constellation4: {
    ele_dmg_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
    energyRegen: skillParam_gen.constellation4[2],
    cd: skillParam_gen.constellation4[3],
    burst_dmg_: skillParam_gen.constellation4[4],
  },
  constellation6: {
    defIgn_: skillParam_gen.constellation6[0],
    stellarconduct_critDMG_: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
const { lockRevelation, lockStellarRadianceSc } = allBoolConditionals(info.key)
const { c1 } = allBoolConditionals(info.key)
const { c4 } = allListConditionals(info.key, ['hit'])
const { c2 } = allListConditionals(info.key, ['2', '3', '4'])

const hexOn = lockRevelation.ifOn(1)
const nodeLk_dmgInc = prod(percent(dm.lockedPassive.dmgInc), final.atk)
const c1_sc_dmg_ = c1.ifOn(
  lockRevelation.ifOn(
    cmpGE(constellation, 1, dm.constellation1.electro_stellarconduct_dmg_)
  )
)
const c2_eleMas = lockRevelation.ifOn(
  cmpGE(
    constellation,
    2,
    c2.map({
      '2': dm.constellation2.eleMas[1],
      '3': dm.constellation2.eleMas[2],
      '4': dm.constellation2.eleMas[3],
    })
  )
)
const c4_electro_dmg_ = cmpGE(
  constellation,
  4,
  c4.map({ hit: dm.constellation4.ele_dmg_ })
)
const c4_burst_dmg_ = lockRevelation.ifOn(
  cmpGE(constellation, 4, dm.constellation4.burst_dmg_)
)
const c6_defIgn_ = cmpGE(constellation, 6, dm.constellation6.defIgn_)
const c6_sc_critDMG_ = lockRevelation.ifOn(
  cmpGE(constellation, 6, dm.constellation6.stellarconduct_critDMG_)
)
const a4_skill_dmg_ = cmpGE(
  ascension,
  4,
  prod(final.eleMas, percent(dm.passive2.eleMas_dmg_))
)
const belowC2 = cmpGE(constellation, 2, '', 'infer')
const atLeastC2 = cmpGE(constellation, 2, 'infer', '')
const lockOn = cmpGE(hexOn, 1, 'infer', '')
const a1NonStellar = cmpGE(
  prod(hexOn, lockStellarRadianceSc.ifOff(1)),
  1,
  'infer',
  ''
)
const a1Stellar = cmpGE(
  prod(hexOn, lockStellarRadianceSc.ifOn(1)),
  1,
  'infer',
  ''
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  hexereiTally(lockRevelation.ifOn(1)),
  // C3 The Five Great Mysteries (skill); C5 The Ironbound Oath (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.skill.add(a4_skill_dmg_),
  ownBuff.premod.dmg_.burst.add(c4_burst_dmg_),
  ownBuff.premod.critDMG_.stellarconduct.add(c6_sc_critDMG_),
  teamBuff.premod.dmg_.electro.add(sum(c4_electro_dmg_, c1_sc_dmg_)),
  teamBuff.premod.dmg_.stellarconduct.add(c1_sc_dmg_),
  // WR any(lookup, dest is Yae, dest is active)
  ownBuff.premod.eleMas.add(c2_eleMas),
  notOwnBuff.premod.eleMas.add(cmpNE(destIsActive, 0, c2_eleMas)),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_1', info, 'atk', dm.skill.dmg1, 'skill', { cond: belowC2 }),
  dmg(
    'skill_2',
    info,
    'atk',
    dm.skill.dmg2,
    'skill',
    undefined,
    enemyDebuff.common.defIgn.add(c6_defIgn_)
  ),
  dmg(
    'skill_3',
    info,
    'atk',
    dm.skill.dmg3,
    'skill',
    undefined,
    enemyDebuff.common.defIgn.add(c6_defIgn_)
  ),
  dmg(
    'skill_4',
    info,
    'atk',
    dm.skill.dmg4,
    'skill',
    { cond: atLeastC2 },
    enemyDebuff.common.defIgn.add(c6_defIgn_)
  ),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  dmg('burst_tenko', info, 'atk', dm.burst.tenkoDmg, 'burst'),
  dmg(
    'lock_skill_1',
    info,
    'atk',
    dm.skill.dmg1,
    'skill',
    { cond: cmpGE(prod(hexOn, cmpGE(constellation, 2, 0, 1)), 1, 'infer', '') },
    ownBuff.formula.base.skill.add(nodeLk_dmgInc)
  ),
  dmg(
    'lock_skill_2',
    info,
    'atk',
    dm.skill.dmg2,
    'skill',
    { cond: lockOn },
    enemyDebuff.common.defIgn.add(c6_defIgn_),
    ownBuff.formula.base.skill.add(nodeLk_dmgInc)
  ),
  dmg(
    'lock_skill_3',
    info,
    'atk',
    dm.skill.dmg3,
    'skill',
    { cond: lockOn },
    enemyDebuff.common.defIgn.add(c6_defIgn_),
    ownBuff.formula.base.skill.add(nodeLk_dmgInc)
  ),
  dmg(
    'lock_skill_4',
    info,
    'atk',
    dm.skill.dmg4,
    'skill',
    { cond: cmpGE(prod(hexOn, cmpGE(constellation, 2, 1)), 1, 'infer', '') },
    enemyDebuff.common.defIgn.add(c6_defIgn_),
    ownBuff.formula.base.skill.add(nodeLk_dmgInc)
  ),
  customDmg(
    'a1',
    info.ele,
    'elemental',
    prod(percent(dm.passive1.dmg), final.atk),
    { cond: cmpGE(ascension, 1, a1NonStellar, '') }
  ),
  customDmg(
    'a1_stellar',
    'electro',
    'elemental',
    prod(percent(dm.passive1.stellarDmg), final.atk),
    { cond: cmpGE(ascension, 1, a1Stellar, '') }
  ),
  customDmg(
    'lock_stellar',
    'electro',
    'elemental',
    prod(percent(dm.lockedPassive.stellarDmg), final.atk),
    { cond: a1Stellar }
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)

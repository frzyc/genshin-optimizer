import type { CharacterKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import {
  cmpEq,
  cmpGE,
  cmpNE,
  max,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando'
import {
  activeCharBuff,
  allBoolConditionals,
  allNumConditionals,
  allStatics,
  customDmg,
  enemyDebuff,
  percent,
  register,
  self,
  selfBuff,
  target,
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Nahida'
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
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    pressDmg: skillParam_gen.skill[s++],
    holdDmg: skillParam_gen.skill[s++],
    karmaAtkDmg: skillParam_gen.skill[s++],
    karmaEleMasDmg: skillParam_gen.skill[s++],
    triggerInterval: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    pressCd: skillParam_gen.skill[s++][0],
    holdCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg_1: skillParam_gen.burst[b++],
    dmg_2: skillParam_gen.burst[b++],
    intervalDec_1: skillParam_gen.burst[b++],
    intervalDec_2: skillParam_gen.burst[b++],
    durationInc1: skillParam_gen.burst[b++],
    durationInc2: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    energyCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    eleMas_: skillParam_gen.passive1[0][0],
    maxEleMas: skillParam_gen.passive1[1][0],
  },
  passive2: {
    eleMas_min: skillParam_gen.passive2[0][0],
    eleMas_maxCounted: skillParam_gen.passive2[1][0],
    eleMas_dmg_: skillParam_gen.passive2[2][0],
    eleMas_critRate_: skillParam_gen.passive2[3][0],
  },
  constellation2: {
    critRate_: skillParam_gen.constellation2[0],
    critDMG_: 1,
    defDec_: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
  },
  constellation4: {
    eleMas: skillParam_gen.constellation4,
  },
  constellation6: {
    atkDmg: skillParam_gen.constellation6[0],
    eleMasDmg: skillParam_gen.constellation6[1],
    cd: skillParam_gen.constellation6[2],
    duration: skillParam_gen.constellation6[3],
    triggers: skillParam_gen.constellation6[4],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = self
const { a1ActiveInBurst, c2Bloom, c2QSA, partyInBurst } = allBoolConditionals(
  info.key
)
const { c4Count } = allNumConditionals(info.key, 'sum', true, 0, 4)
const { c2_critRate_, c2_critDMG_, c2qsa_defRed_ } = allStatics(info.key)

const count = team.common.count

const pyroLevel = sum(count.pyro, cmpGE(constellation, 1, 1))
const burst_karma_dmg_ = partyInBurst.ifOn(
  percent(
    cmpGE(
      pyroLevel,
      1,
      cmpEq(
        pyroLevel,
        1,
        subscript(burst, dm.burst.dmg_1),
        subscript(burst, dm.burst.dmg_2)
      )
    )
  )
)

const electroLevel = sum(count.electro, cmpGE(constellation, 1, 1))
const _burst_skillIntervalDec = partyInBurst.ifOn(
  percent(
    cmpGE(
      electroLevel,
      1,
      cmpEq(
        electroLevel,
        1,
        subscript(burst, dm.burst.intervalDec_1),
        subscript(burst, dm.burst.intervalDec_2)
      )
    )
  )
)

const hydroLevel = sum(count.hydro, cmpGE(constellation, 1, 1))
const _burst_durationInc = partyInBurst.ifOn(
  percent(
    cmpGE(
      hydroLevel,
      1,
      cmpEq(
        hydroLevel,
        1,
        subscript(burst, dm.burst.durationInc1),
        subscript(burst, dm.burst.durationInc2)
      )
    )
  )
)

const a1InBurst_eleMas = cmpGE(
  ascension,
  1,
  a1ActiveInBurst.ifOn(
    // Either party is in burst, or this is a teammate
    cmpGE(
      sum(partyInBurst.ifOn(1), cmpNE(target.common.isActive, 1, 1)),
      1,
      min(
        prod(percent(dm.passive1.eleMas_), team.premod.eleMas.max),
        dm.passive1.maxEleMas
      )
    )
  )
)

const passive2Elemas = min(
  max(sum(final.eleMas, -dm.passive2.eleMas_min), 0),
  dm.passive2.eleMas_maxCounted
)
const a4Karma_dmg_ = percent(
  cmpGE(ascension, 4, prod(percent(dm.passive2.eleMas_dmg_), passive2Elemas))
)
const a4Karma_critRate_ = percent(
  cmpGE(
    ascension,
    4,
    prod(percent(dm.passive2.eleMas_critRate_), passive2Elemas)
  )
)
const t = register(
  info.key,
  entriesForChar(info, data_gen),
  selfBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  selfBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  selfBuff.premod.eleMas.add(
    cmpGE(
      constellation,
      4,
      subscript(c4Count, [NaN, ...dm.constellation4.eleMas])
    )
  ),

  activeCharBuff.final.eleMas.add(a1InBurst_eleMas),

  c2_critRate_.add(
    cmpGE(constellation, 2, c2Bloom.ifOn(percent(dm.constellation2.critRate_)))
  ),
  teamBuff.premod.critRate_.burning.reread(c2_critRate_),
  teamBuff.premod.critRate_.bloom.reread(c2_critRate_),
  teamBuff.premod.critRate_.hyperbloom.reread(c2_critRate_),
  teamBuff.premod.critRate_.burgeon.reread(c2_critRate_),

  c2_critDMG_.add(
    cmpGE(constellation, 2, c2Bloom.ifOn(percent(dm.constellation2.critDMG_)))
  ),
  teamBuff.premod.critDMG_.burning.reread(c2_critDMG_),
  teamBuff.premod.critDMG_.bloom.reread(c2_critDMG_),
  teamBuff.premod.critDMG_.hyperbloom.reread(c2_critDMG_),
  teamBuff.premod.critDMG_.burgeon.reread(c2_critDMG_),

  c2qsa_defRed_.add(
    cmpGE(constellation, 2, c2QSA.ifOn(percent(dm.constellation2.defDec_)))
  ),
  enemyDebuff.common.defRed_.reread(c2qsa_defRed_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg(`charged`, info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  (['press', 'hold'] as const).flatMap((k) =>
    dmg(`skill_${k}`, info, 'atk', dm.skill[`${k}Dmg`], 'skill')
  ),
  customDmg(
    'karma_dmg',
    info.ele,
    'skill',
    sum(
      prod(percent(subscript(skill, dm.skill.karmaAtkDmg)), final.atk),
      prod(percent(subscript(skill, dm.skill.karmaEleMasDmg)), final.eleMas)
    ),
    undefined,
    selfBuff.premod.dmg_.add(sum(a4Karma_dmg_, burst_karma_dmg_)),
    selfBuff.premod.critRate_.add(a4Karma_critRate_)
  )
)
export default t

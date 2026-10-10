import { absorbableEle, type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, shield } from './util'

const key: CharacterKey = 'LanYan'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2.1
      skillParam_gen.auto[a++], // 2.2
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    ringDmg: skillParam_gen.skill[s++],
    shieldMult: skillParam_gen.skill[s++],
    shieldFlat: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg: skillParam_gen.passive1[0][0],
  },
  passive2: {
    skill_dmgInc: skillParam_gen.passive2[0][0],
    burst_dmgInc: skillParam_gen.passive2[1][0],
  },
  constellation2: {
    shieldRestore: skillParam_gen.constellation2[0],
    cd: skillParam_gen.constellation2[1],
  },
  constellation4: {
    eleMas: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'c4AfterBurst')
const { c4AfterBurst } = allBoolConditionals(info.key)

const a4_skill_dmgInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.skill_dmgInc), final.eleMas)
)
const a4_burst_dmgInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.burst_dmgInc), final.eleMas)
)
const c4AfterBurst_eleMas = c4AfterBurst.ifOn(
  cmpGE(constellation, 4, dm.constellation4.eleMas)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Swallow-Wisp Pinion Dance (skill); C5 Lustrous Moonrise (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.formula.base.skill.add(a4_skill_dmgInc),
  ownBuff.formula.base.burst.add(a4_burst_dmgInc),
  teamBuff.premod.eleMas.add(c4AfterBurst_eleMas),

  // Formulas — catalyst anemo: NA/CA/plunge inherit anemo
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.ringDmg, 'skill'),
  shield(
    'skill_shield',
    'atk',
    dm.skill.shieldMult,
    dm.skill.shieldFlat,
    'skill'
  ),
  shield(
    'skill_anemoShield',
    'atk',
    dm.skill.shieldMult,
    dm.skill.shieldFlat,
    'skill',
    { ele: 'anemo' }
  ),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  absorbableEle.flatMap((ele) =>
    dmg(`a1_${ele}`, info, 'atk', dm.skill.ringDmg, 'skill', {
      ele,
      baseMulti: percent(dm.passive1.dmg),
      cond: cmpGE(ascension, 1, 'infer', ''),
    })
  )
)

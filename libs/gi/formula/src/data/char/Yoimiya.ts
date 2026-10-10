import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Yoimiya'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], //x2
      skillParam_gen.auto[1],
      skillParam_gen.auto[2],
      skillParam_gen.auto[3], //x2
      skillParam_gen.auto[4],
    ],
  },
  charged: {
    hit: skillParam_gen.auto[5],
    full: skillParam_gen.auto[6],
    kindling: skillParam_gen.auto[7],
  },
  plunging: {
    dmg: skillParam_gen.auto[8],
    low: skillParam_gen.auto[9],
    high: skillParam_gen.auto[10],
  },
  skill: {
    dmg_: skillParam_gen.skill[3],
    duration: skillParam_gen.skill[1][0],
    cd: skillParam_gen.skill[2][0],
  },
  burst: {
    dmg: skillParam_gen.burst[0],
    exp: skillParam_gen.burst[1],
    duration: skillParam_gen.burst[3][0],
    cd: skillParam_gen.burst[4][0],
    cost: skillParam_gen.burst[5][0],
  },
  passive1: {
    pyro_dmg_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
    maxStacks: 10,
  },
  passive2: {
    fixed_atk_: skillParam_gen.passive2[0][0],
    var_atk_: skillParam_gen.passive2[1][0],
    duration: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    burst_durationInc: skillParam_gen.constellation1[0],
    atk_: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2],
  },
  constellation2: {
    pyro_dmg_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
  },
  constellation3: {},
  constellation4: {
    cdRed: skillParam_gen.constellation4[0],
  },
  constellation5: {},
  constellation6: {
    chance: skillParam_gen.constellation6[0],
    dmg_: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { auto, skill, ascension, constellation },
} = own
const { burst } = allBoolConditionals(info.key)
const { skill: skillCond } = allListConditionals(info.key, ['skill'])
const { c1 } = allListConditionals(info.key, ['c1'])
const { c2 } = allListConditionals(info.key, ['c2'])
const { a1 } = allNumConditionals(info.key, true, 0, dm.passive1.maxStacks)

const skillOn = skillCond.map({ skill: 1 })
const infusionOn = cmpGE(skillOn, 1, 'infer', '')
const skillMult = percent(talentSubscript(skill, dm.skill.dmg_))
const a1_pyro_dmg_ = prod(
  skillOn,
  cmpGE(ascension, 1, prod(percent(dm.passive1.pyro_dmg_), a1))
)
const a4_atk_ = burst.ifOn(
  cmpGE(
    ascension,
    4,
    sum(
      percent(dm.passive2.fixed_atk_),
      prod(percent(dm.passive2.var_atk_), a1)
    )
  )
)
const c1_atk_ = cmpGE(
  constellation,
  1,
  percent(c1.map({ c1: dm.constellation1.atk_ }))
)
const c2_pyro_dmg_ = cmpGE(
  constellation,
  2,
  percent(c2.map({ c2: dm.constellation2.pyro_dmg_ }))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Trickster's Flare (skill); C5 Ryuukin Saxifrage (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk_.add(c1_atk_),
  ownBuff.premod.dmg_.pyro.add(sum(a1_pyro_dmg_, c2_pyro_dmg_)),
  // WR A4 dest ≠ Yoimiya
  notOwnBuff.premod.atk_.add(a4_atk_),

  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal', { ele: 'physical' }),
    ...dmg(`normal_${i}_pyro`, info, 'atk', arr, 'normal', {
      ele: 'pyro',
      cond: infusionOn,
      baseMulti: skillMult,
    }),
  ]),
  dmg('charged_hit', info, 'atk', dm.charged.hit, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_full', info, 'atk', dm.charged.full, 'charged', { ele: 'pyro' }),
  dmg('charged_kindling', info, 'atk', dm.charged.kindling, 'charged', {
    ele: 'pyro',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst', { ele: 'pyro' }),
  dmg('burst_exp', info, 'atk', dm.burst.exp, 'burst', { ele: 'pyro' }),
  dm.normal.hitArr.flatMap((arr, i) => {
    const kindling = i === 0 || i === 3 ? arr.map((val) => val * 2) : arr
    return customDmg(
      `c6_${i}`,
      'pyro',
      'normal',
      prod(
        percent(talentSubscript(auto, kindling)),
        percent(dm.constellation6.dmg_),
        final.atk,
        skillMult
      ),
      { cond: cmpGE(constellation, 6, infusionOn, '') }
    )
  }),

  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.cost)
)

import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  cmpGE,
  cmpNE,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allNumConditionals,
  customDmg,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Yelan'
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
      skillParam_gen.auto[a++], // 4x3
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
    barb: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    resetChance: skillParam_gen.skill[s++][0],
    maxDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    pressDmg: skillParam_gen.burst[b++],
    throwDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    hp_Arr: [0, ...skillParam_gen.passive1.map(([a]) => a)],
  },
  passive2: {
    baseDmg_: skillParam_gen.passive2[0][0],
    stackDmg_: skillParam_gen.passive2[1][0],
    maxDmg_: skillParam_gen.passive2[2][0],
    maxStacks: 14,
  },
  constellation1: {
    addlCharge: skillParam_gen.constellation1[0],
  },
  constellation2: {
    arrowDmg_: skillParam_gen.constellation2[0],
    cd: skillParam_gen.constellation2[1],
  },
  constellation4: {
    bonusHp_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
    maxHp_: skillParam_gen.constellation4[2],
    maxStacks: 4,
  },
  constellation6: {
    charges: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    dmg_: skillParam_gen.constellation6[2],
  },
}

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { auto, ascension, constellation },
} = own
const { a4Stacks } = allNumConditionals(
  info.key,
  true,
  0,
  dm.passive2.maxStacks
)
const { c4Stacks } = allNumConditionals(
  info.key,
  true,
  0,
  dm.constellation4.maxStacks
)

const a1_hp_ = cmpGE(
  ascension,
  1,
  subscript(own.common.eleCount, dm.passive1.hp_Arr)
)
const a4Dmg_ = cmpGE(
  ascension,
  4,
  cmpGE(
    a4Stacks,
    1,
    sum(
      percent(dm.passive2.baseDmg_),
      prod(a4Stacks, percent(dm.passive2.stackDmg_))
    )
  )
)
const c4_hp_ = cmpGE(
  constellation,
  4,
  prod(c4Stacks, percent(dm.constellation4.bonusHp_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Beware, Ye Who Wander (burst); C5 Deeper Yonder (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.hp_.add(a1_hp_),
  // WR teamBuff.premod.all_dmg_ dest-gated to active.
  teamBuff.premod.dmg_.add(cmpNE(destIsActive, 0, a4Dmg_)),
  teamBuff.premod.hp_.add(c4_hp_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_aimedCharged', info, 'atk', dm.charged.aimedCharged, 'charged', {
    ele: 'hydro',
  }),
  dmg('charged_barb', info, 'hp', dm.charged.barb, 'charged', { ele: 'hydro' }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'hp', dm.skill.dmg, 'skill'),
  dmg('burst_press', info, 'hp', dm.burst.pressDmg, 'burst'),
  dmg('burst_throw', info, 'hp', dm.burst.throwDmg, 'burst'),
  customDmg(
    'c2',
    'hydro',
    'burst',
    prod(percent(dm.constellation2.arrowDmg_), final.hp),
    { cond: cmpGE(constellation, 2, 'infer', '') }
  ),
  customDmg(
    'c6',
    'hydro',
    'charged',
    prod(
      percent(talentSubscript(auto, dm.charged.barb)),
      percent(dm.constellation6.dmg_),
      final.hp
    ),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  ),

  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)

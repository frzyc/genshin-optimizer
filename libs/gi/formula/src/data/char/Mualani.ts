import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { NumNode } from '@genshin-optimizer/pando/engine'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allListConditionals,
  customDmg,
  customParam,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Mualani'
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
    basicDmg: skillParam_gen.skill[s++],
    waveDmgBonus: skillParam_gen.skill[s++],
    surgingDmgBonus: skillParam_gen.skill[s++],
    biteCd: skillParam_gen.skill[s++][0],
    pointLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    pointsRegen: skillParam_gen.passive1[0][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
    dmg: [
      skillParam_gen.passive2[1][0],
      skillParam_gen.passive2[2][0],
      skillParam_gen.passive2[3][0],
    ],
  },
  passive3: {
    pointReduceNatlan: skillParam_gen.passive3![0][0],
    pointReduceOthers: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    dmgInc: skillParam_gen.constellation1[0],
    pointReduce: skillParam_gen.constellation1[1],
  },
  constellation2: {},
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    shot_dmg_: skillParam_gen.constellation4[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'a4Stacks') states `'1'` / `'2'` / `'3'`
const { a4Stacks } = allListConditionals(info.key, ['1', '2', '3'])

// WR input.total.hp
const wave_bite_dmgInc = prod(
  percent(talentSubscript(skill, dm.skill.waveDmgBonus)),
  final.hp
)
const wave2_bite_dmgInc = prod(2, wave_bite_dmgInc)
const surging_bite_dmgInc = sum(
  prod(3, wave_bite_dmgInc),
  prod(percent(talentSubscript(skill, dm.skill.surgingDmgBonus)), final.hp)
)
const a4Stacks_burst_dmgInc = cmpGE(
  ascension,
  4,
  prod(
    percent(
      a4Stacks.map({
        '1': dm.passive2.dmg[0],
        '2': dm.passive2.dmg[1],
        '3': dm.passive2.dmg[2],
      })
    ),
    final.hp
  )
)
const c1First_surging_dmgInc = cmpGE(
  constellation,
  1,
  prod(percent(dm.constellation1.dmgInc), final.hp)
)
const c4_burst_dmg_ = cmpGE(
  constellation,
  4,
  percent(dm.constellation4.shot_dmg_)
)

// WR dmgNode('hp', …, 'normal', overlay, undefined, 'skill')
function sharkBite(name: string, extraBase?: NumNode) {
  return customDmg(
    name,
    'hydro',
    'normal',
    prod(percent(talentSubscript(skill, dm.skill.basicDmg)), final.hp),
    undefined,
    ...(extraBase ? [ownBuff.formula.base.add(extraBase)] : [])
  )
}

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Surfing Atop Joyous Seas (skill); C5 Same Style of Surfboard on Sale! (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // WR premod.burst_dmgInc
  ownBuff.formula.base.burst.add(a4Stacks_burst_dmgInc),
  ownBuff.premod.dmg_.burst.add(c4_burst_dmg_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  sharkBite('skill_basicDmg'),
  sharkBite('skill_stack1Dmg', wave_bite_dmgInc),
  sharkBite('skill_stack2Dmg', wave2_bite_dmgInc),
  sharkBite('skill_surgingDmg', surging_bite_dmgInc),
  dmg('burst', info, 'hp', dm.burst.dmg, 'burst'),
  customDmg(
    'c1',
    'hydro',
    'normal',
    prod(percent(talentSubscript(skill, dm.skill.basicDmg)), final.hp),
    { cond: cmpGE(constellation, 1, 'infer', '') },
    ownBuff.formula.base.add(sum(surging_bite_dmgInc, c1First_surging_dmgInc))
  ),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)

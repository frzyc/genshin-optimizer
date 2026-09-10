import { absorbableEle, type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  cmpGE,
  min,
  prod,
  subscript,
  sum,
  type NumNode,
  type StrNode,
} from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customDmg,
  hexereiTally,
  own,
  ownBuff,
  percent,
  register,
  team,
  teamBuff,
  type TagMapNodeEntries,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Varka'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2.2
      skillParam_gen.auto[a++], // 2.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 4.1
      skillParam_gen.auto[a++], // 4.2
      skillParam_gen.auto[a++], // 5.1
      skillParam_gen.auto[a++], // 5.2
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++],
    dmg2: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    skillDuration: skillParam_gen.skill[s++][0],
    hitArr: [
      skillParam_gen.skill[s++], // 1 ele
      skillParam_gen.skill[s++], // 2.2 ele
      skillParam_gen.skill[s++], // 2.1
      skillParam_gen.skill[s++], // 3.2 ele
      skillParam_gen.skill[s++], // 3.1
      skillParam_gen.skill[s++], // 4.1 ele
      skillParam_gen.skill[s++], // 4.2
      skillParam_gen.skill[s++], // 5.1 ele
      skillParam_gen.skill[s++], // 5.2
    ],
    cDmg1: skillParam_gen.skill[s++], // ele
    cDmg2: skillParam_gen.skill[s++],
    fourWindDmg1: skillParam_gen.skill[s++], // ele
    fourWindDmg2: skillParam_gen.skill[s++],
    azureDmg1: skillParam_gen.skill[s++], // ele
    azureDmg2: skillParam_gen.skill[s++],
    fourWindCd: skillParam_gen.skill[s++][0],
    skillPressCd: skillParam_gen.skill[s++][0],
    skillHoldCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg1: skillParam_gen.burst[b++],
    dmg2: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    atkFactor: 1000,
    anemo_dmg_: skillParam_gen.passive1[0][0],
    max_anemo_dmg_: skillParam_gen.passive1[1][0],
    twoAnemoOrTwoPhec_mult_: skillParam_gen.passive1[2][0],
    twoAnemoAndTwoPhec_mult_: skillParam_gen.passive1[3][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
    dmg_: skillParam_gen.passive2[1][0],
    maxStacks: skillParam_gen.passive2[2][0],
    stackGainPerChar: skillParam_gen.passive2[3][0],
  },
  lockedPassive: {
    cdReduce: skillParam_gen.lockedPassive![0][0],
  },
  constellation1: {
    dmg: skillParam_gen.constellation1[0],
  },
  constellation2: {
    dmg: skillParam_gen.constellation2[0],
  },
  constellation4: {
    anemo_phec_dmg_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    three: skillParam_gen.constellation6[0],
    crit_dmg_: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'lockHomework') `'on'`; lookup(cond(key, 'a4Stacks'), 1..max)
const { lockHomework } = allBoolConditionals(info.key)
const { a4Stacks } = allNumConditionals(
  info.key,
  true,
  0,
  dm.passive2.maxStacks
)
// WR condReadNode `[key, c4Swirl${ele}]` — state is the element, not `'on'`
const { c4Swirlpyro } = allListConditionals(info.key, ['pyro'])
const { c4Swirlhydro } = allListConditionals(info.key, ['hydro'])
const { c4Swirlcryo } = allListConditionals(info.key, ['cryo'])
const { c4Swirlelectro } = allListConditionals(info.key, ['electro'])

const {
  pyro: pyroCount,
  hydro: hydroCount,
  electro: electroCount,
  cryo: cryoCount,
  anemo: anemoCount,
} = team.common.count

const phecEles = ['physical', 'pyro', 'hydro', 'electro', 'cryo'] as const
type PhecEle = (typeof phecEles)[number]

/** WR threshold tally.pyro > hydro > electro > cryo > physical */
function phecCond(ele: PhecEle): StrNode {
  switch (ele) {
    case 'pyro':
      return cmpGE(pyroCount, 1, 'infer', '')
    case 'hydro':
      return cmpGE(pyroCount, 1, '', cmpGE(hydroCount, 1, 'infer', ''))
    case 'electro':
      return cmpGE(
        pyroCount,
        1,
        '',
        cmpGE(hydroCount, 1, '', cmpGE(electroCount, 1, 'infer', ''))
      )
    case 'cryo':
      return cmpGE(
        pyroCount,
        1,
        '',
        cmpGE(
          hydroCount,
          1,
          '',
          cmpGE(electroCount, 1, '', cmpGE(cryoCount, 1, 'infer', ''))
        )
      )
    case 'physical':
      return cmpGE(
        sum(
          cmpGE(pyroCount, 1, 1),
          cmpGE(hydroCount, 1, 1),
          cmpGE(electroCount, 1, 1),
          cmpGE(cryoCount, 1, 1)
        ),
        1,
        '',
        'infer'
      )
  }
}

const phecNotPhysical = cmpGE(
  sum(
    cmpGE(pyroCount, 1, 1),
    cmpGE(hydroCount, 1, 1),
    cmpGE(electroCount, 1, 1),
    cmpGE(cryoCount, 1, 1)
  ),
  1,
  1
)
const phecEleCount = cmpGE(
  pyroCount,
  1,
  pyroCount,
  cmpGE(
    hydroCount,
    1,
    hydroCount,
    cmpGE(electroCount, 1, electroCount, cmpGE(cryoCount, 1, cryoCount, 0))
  )
)

const a1Phec_dmg_ = min(
  prod(
    own.premod.atk,
    1 / dm.passive1.atkFactor,
    percent(dm.passive1.anemo_dmg_)
  ),
  percent(dm.passive1.max_anemo_dmg_)
)
const a1Phec_sturm_mult_ = sum(
  1,
  cmpGE(
    ascension,
    1,
    prod(
      phecNotPhysical,
      subscript(sum(cmpGE(phecEleCount, 2, 1), cmpGE(anemoCount, 2, 1)), [
        0,
        dm.passive1.twoAnemoOrTwoPhec_mult_ - 1,
        dm.passive1.twoAnemoAndTwoPhec_mult_ - 1,
      ])
    )
  )
)
const a4Stacks_sturm_dmg_ = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.dmg_), a4Stacks)
)
const c1Phec_sturm_mult_ = prod(
  percent(dm.constellation1.dmg),
  a1Phec_sturm_mult_
)
const c4SwirlOn = {
  pyro: c4Swirlpyro.map({ pyro: 1 }),
  hydro: c4Swirlhydro.map({ hydro: 1 }),
  cryo: c4Swirlcryo.map({ cryo: 1 }),
  electro: c4Swirlelectro.map({ electro: 1 }),
} as const
const c4AnySwirl = cmpGE(
  sum(...absorbableEle.map((ele) => c4SwirlOn[ele])),
  1,
  1
)
const c6Stacks_critDMG_ = cmpGE(
  constellation,
  6,
  cmpGE(ascension, 4, prod(percent(dm.constellation6.crit_dmg_), a4Stacks))
)

function sturmPhec(
  name: string,
  table: number[],
  move: 'normal' | 'charged' | 'skill',
  baseMulti: NumNode,
  gate?: NumNode
): TagMapNodeEntries {
  return phecEles.flatMap((ele) => {
    const eleCond = phecCond(ele)
    return customDmg(
      ele === 'physical' ? name : `${name}_${ele}`,
      ele,
      move,
      prod(percent(talentSubscript(skill, table)), final.atk, baseMulti),
      { cond: gate ? cmpGE(gate, 1, eleCond, '') : eleCond },
      // WR data() phecSturmData.premod.all_dmg_
      ownBuff.premod.dmg_.add(a4Stacks_sturm_dmg_)
    )
  })
}

function sturmAnemo(
  name: string,
  table: number[],
  move: 'normal' | 'charged' | 'skill',
  baseMulti: NumNode,
  gate?: NumNode
): TagMapNodeEntries {
  return customDmg(
    name,
    'anemo',
    move,
    prod(percent(talentSubscript(skill, table)), final.atk, baseMulti),
    { cond: gate ? cmpGE(gate, 1, 'infer', '') : 'infer' },
    // WR data() anemoSturmData.premod.all_dmg_
    ownBuff.premod.dmg_.add(a4Stacks_sturm_dmg_)
  )
}

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // WR flags.isHexerei
  hexereiTally(lockHomework.ifOn(1)),
  // C3 Windbound Execution (skill); C5 Northwind Avatar (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // WR A1: anemo_dmg_ when phec ≠ physical; matching phec ele dmg_
  ownBuff.premod.dmg_.anemo.add(
    cmpGE(ascension, 1, prod(phecNotPhysical, a1Phec_dmg_))
  ),
  ownBuff.premod.dmg_.pyro.add(
    cmpGE(ascension, 1, prod(cmpGE(pyroCount, 1, 1), a1Phec_dmg_))
  ),
  ownBuff.premod.dmg_.hydro.add(
    cmpGE(
      ascension,
      1,
      prod(cmpGE(pyroCount, 1, 0, cmpGE(hydroCount, 1, 1)), a1Phec_dmg_)
    )
  ),
  ownBuff.premod.dmg_.electro.add(
    cmpGE(
      ascension,
      1,
      prod(
        cmpGE(
          pyroCount,
          1,
          0,
          cmpGE(hydroCount, 1, 0, cmpGE(electroCount, 1, 1))
        ),
        a1Phec_dmg_
      )
    )
  ),
  ownBuff.premod.dmg_.cryo.add(
    cmpGE(
      ascension,
      1,
      prod(
        cmpGE(
          pyroCount,
          1,
          0,
          cmpGE(
            hydroCount,
            1,
            0,
            cmpGE(electroCount, 1, 0, cmpGE(cryoCount, 1, 1))
          )
        ),
        a1Phec_dmg_
      )
    )
  ),
  ownBuff.premod.critDMG_.add(c6Stacks_critDMG_),
  // WR teamBuff C4 swirl anemo + matching ele
  teamBuff.premod.dmg_.anemo.add(
    cmpGE(constellation, 4, prod(c4AnySwirl, dm.constellation4.anemo_phec_dmg_))
  ),
  absorbableEle.map((ele) =>
    teamBuff.premod.dmg_[ele].add(
      cmpGE(
        constellation,
        4,
        prod(c4SwirlOn[ele], dm.constellation4.anemo_phec_dmg_)
      )
    )
  ),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_2', info, 'atk', dm.charged.dmg2, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.skillDmg, 'skill'),
  // WR skill NA/CA/fourWind/azure: talent skill, listing-local ele + all_dmg_ + sturm_mult
  sturmPhec('skill_na1', dm.skill.hitArr[0], 'normal', a1Phec_sturm_mult_),
  sturmAnemo('skill_na21', dm.skill.hitArr[2], 'normal', a1Phec_sturm_mult_),
  sturmPhec('skill_na22', dm.skill.hitArr[1], 'normal', a1Phec_sturm_mult_),
  sturmAnemo('skill_na31', dm.skill.hitArr[4], 'normal', a1Phec_sturm_mult_),
  sturmPhec('skill_na32', dm.skill.hitArr[3], 'normal', a1Phec_sturm_mult_),
  sturmPhec('skill_na41', dm.skill.hitArr[5], 'normal', a1Phec_sturm_mult_),
  sturmAnemo('skill_na42', dm.skill.hitArr[6], 'normal', a1Phec_sturm_mult_),
  sturmPhec('skill_na51', dm.skill.hitArr[7], 'normal', a1Phec_sturm_mult_),
  sturmAnemo('skill_na52', dm.skill.hitArr[8], 'normal', a1Phec_sturm_mult_),
  sturmPhec('skill_ca1', dm.skill.cDmg1, 'charged', a1Phec_sturm_mult_),
  sturmAnemo('skill_ca2', dm.skill.cDmg2, 'charged', a1Phec_sturm_mult_),
  sturmPhec(
    'skill_fourWind1',
    dm.skill.fourWindDmg1,
    'skill',
    a1Phec_sturm_mult_
  ),
  sturmAnemo(
    'skill_fourWind2',
    dm.skill.fourWindDmg2,
    'skill',
    a1Phec_sturm_mult_
  ),
  sturmPhec('skill_azure1', dm.skill.azureDmg1, 'charged', a1Phec_sturm_mult_),
  sturmAnemo('skill_azure2', dm.skill.azureDmg2, 'charged', a1Phec_sturm_mult_),
  phecEles.flatMap((ele) =>
    dmg(
      ele === 'physical' ? 'burst_dmg1' : `burst_dmg1_${ele}`,
      info,
      'atk',
      dm.burst.dmg1,
      'burst',
      { ele, cond: phecCond(ele) }
    )
  ),
  dmg('burst_dmg2', info, 'atk', dm.burst.dmg2, 'burst'),
  sturmPhec(
    'c1_fourWind1',
    dm.skill.fourWindDmg1,
    'skill',
    c1Phec_sturm_mult_,
    constellation
  ),
  sturmAnemo(
    'c1_fourWind2',
    dm.skill.fourWindDmg2,
    'skill',
    c1Phec_sturm_mult_,
    constellation
  ),
  sturmPhec(
    'c1_azure1',
    dm.skill.azureDmg1,
    'charged',
    c1Phec_sturm_mult_,
    constellation
  ),
  sturmAnemo(
    'c1_azure2',
    dm.skill.azureDmg2,
    'charged',
    c1Phec_sturm_mult_,
    constellation
  ),
  customDmg(
    'c2',
    'anemo',
    'elemental',
    prod(percent(dm.constellation2.dmg), final.atk),
    { cond: cmpGE(constellation, 2, 'infer', '') }
  )
)

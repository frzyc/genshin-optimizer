import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  customDmg,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import {
  dataGenToCharInfo,
  dmg,
  entriesForChar,
  shield,
  talentSubscript,
} from './util'

const key: CharacterKey = 'Baizhu'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[++a], // 3x2
      skillParam_gen.auto[++a], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    stamina: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    healHp: skillParam_gen.skill[s++],
    healBase: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    shieldHp: skillParam_gen.burst[b++],
    shieldBase: skillParam_gen.burst[b++],
    shieldDuration: skillParam_gen.burst[b++][0],
    shieldInterval: skillParam_gen.burst[b++][0],
    healHp: skillParam_gen.burst[b++],
    healBase: skillParam_gen.burst[b++],
    veinDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    energyCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    hpThresh_: skillParam_gen.passive1[0][0],
    heal_: skillParam_gen.passive1[1][0],
    dendro_dmg_: skillParam_gen.passive1[2][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
    burningBloom_dmg_: skillParam_gen.passive2[1][0],
    aggSpread_dmg_: skillParam_gen.passive2[2][0],
    maxHp: skillParam_gen.passive2[3][0],
    lunarbloom_dmg_: skillParam_gen.passive2[4][0],
  },
  passive3: {
    heal: skillParam_gen?.passive3?.[0]?.[0] ?? 0,
  },
  constellation2: {
    atkAmount: skillParam_gen.constellation2[0],
    dmg: skillParam_gen.constellation2[1],
    heal: skillParam_gen.constellation2[2],
    cd: skillParam_gen.constellation2[3],
  },
  constellation4: {
    eleMas: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    healChance: skillParam_gen.constellation6[0],
    vein_dmgInc: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'a1HpStatus' | 'a4AfterHeal' | 'c4AfterBurst')
const { a4AfterHeal, c4AfterBurst } = allBoolConditionals(info.key)
const { a1HpStatus } = allListConditionals(info.key, ['below', 'above'])

const a1Below_heal_ = cmpGE(
  ascension,
  1,
  percent(a1HpStatus.map({ below: dm.passive1.heal_, above: 0 }))
)
const a1Above_dendro_dmg_ = cmpGE(
  ascension,
  1,
  percent(a1HpStatus.map({ below: 0, above: dm.passive1.dendro_dmg_ }))
)

const a4BurningBloom_dmg_ = a4AfterHeal.ifOn(
  cmpGE(
    ascension,
    4,
    min(
      (dm.passive2.maxHp / 1000) * dm.passive2.burningBloom_dmg_,
      prod(percent(dm.passive2.burningBloom_dmg_), final.hp, 1 / 1000)
    )
  )
)
const a4AggSpread_dmg_ = a4AfterHeal.ifOn(
  cmpGE(
    ascension,
    4,
    min(
      (dm.passive2.maxHp / 1000) * dm.passive2.aggSpread_dmg_,
      prod(percent(dm.passive2.aggSpread_dmg_), final.hp, 1 / 1000)
    )
  )
)
const a4lunarBloom_dmg_ = a4AfterHeal.ifOn(
  cmpGE(
    ascension,
    4,
    min(
      (dm.passive2.maxHp / 1000) * dm.passive2.lunarbloom_dmg_,
      prod(percent(dm.passive2.lunarbloom_dmg_), final.hp, 1 / 1000)
    )
  )
)
const c4AfterBurst_eleMas = c4AfterBurst.ifOn(
  cmpGE(constellation, 4, dm.constellation4.eleMas)
)
const c6_vein_dmgInc = cmpGE(
  constellation,
  6,
  prod(percent(dm.constellation6.vein_dmgInc), final.hp)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Holistic Revivification (burst); C5 Universal Diagnosis (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.heal_.add(a1Below_heal_),
  ownBuff.premod.dmg_.dendro.add(a1Above_dendro_dmg_),
  // WR burst_dmgInc → formula.base.burst (no flat dmgInc tag)
  ownBuff.formula.base.burst.add(c6_vein_dmgInc),
  teamBuff.premod.dmg_.burning.add(a4BurningBloom_dmg_),
  teamBuff.premod.dmg_.bloom.add(a4BurningBloom_dmg_),
  teamBuff.premod.dmg_.hyperbloom.add(a4BurningBloom_dmg_),
  teamBuff.premod.dmg_.burgeon.add(a4BurningBloom_dmg_),
  teamBuff.premod.dmg_.aggravate.add(a4AggSpread_dmg_),
  teamBuff.premod.dmg_.spread.add(a4AggSpread_dmg_),
  teamBuff.premod.dmg_.lunarbloom.add(a4lunarBloom_dmg_),
  teamBuff.premod.eleMas.add(c4AfterBurst_eleMas),

  // Formulas — catalyst dendro: NA/CA/plunge inherit dendro
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  customHeal(
    'skill_heal',
    sum(
      prod(percent(talentSubscript(skill, dm.skill.healHp)), final.hp),
      talentSubscript(skill, dm.skill.healBase)
    )
  ),
  shield('burst_shield', 'hp', dm.burst.shieldHp, dm.burst.shieldBase, 'burst'),
  shield(
    'burst_dendroShield',
    'hp',
    dm.burst.shieldHp,
    dm.burst.shieldBase,
    'burst',
    { ele: 'dendro' }
  ),
  customHeal(
    'burst_heal',
    sum(
      prod(percent(talentSubscript(burst, dm.burst.healHp)), final.hp),
      talentSubscript(burst, dm.burst.healBase)
    )
  ),
  dmg('burst', info, 'atk', dm.burst.veinDmg, 'burst'),
  customHeal('passive3_heal', prod(percent(dm.passive3.heal), final.hp)),
  customDmg(
    'c2',
    info.ele,
    'skill',
    prod(percent(dm.constellation2.dmg), final.atk),
    { cond: cmpGE(constellation, 2, 'infer', '') }
  ),
  customHeal(
    'c2_heal',
    sum(
      prod(
        percent(talentSubscript(skill, dm.skill.healHp)),
        final.hp,
        percent(dm.constellation2.heal)
      ),
      prod(
        talentSubscript(skill, dm.skill.healBase),
        percent(dm.constellation2.heal)
      )
    ),
    { cond: cmpGE(constellation, 2, 'infer', '') }
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_shieldDuration', dm.burst.shieldDuration),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.energyCost),
  customParam('a4_duration', dm.passive2.duration, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('c2_cd', dm.constellation2.cd, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('c6_vein_dmgInc', c6_vein_dmgInc, {
    cond: cmpGE(constellation, 6, 'infer', ''),
  })
)

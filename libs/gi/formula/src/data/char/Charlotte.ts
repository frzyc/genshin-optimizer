import { allRegionKeys, type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
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
  team,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Charlotte'
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
    thornDmg: skillParam_gen.auto[8],
    thornInterval: skillParam_gen.auto[9][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    photoPressDmg: skillParam_gen.skill[s++],
    photoHoldDmg: skillParam_gen.skill[s++],
    snapMarkDmg: skillParam_gen.skill[s++],
    snapMarkInterval: skillParam_gen.skill[s++][0],
    snapMarkDuration: skillParam_gen.skill[s++][0],
    focusMarkDmg: skillParam_gen.skill[s++],
    focusMarkInterval: skillParam_gen.skill[s++][0],
    focusMarkDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    finisherCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    castHealBase: skillParam_gen.burst[b++],
    castHealFlat: skillParam_gen.burst[b++],
    skillDmg: skillParam_gen.burst[b++],
    kameraHealBase: skillParam_gen.burst[b++],
    kameraHealFlat: skillParam_gen.burst[b++],
    kameraDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cdReduction: skillParam_gen.passive1[0][0],
    triggers: skillParam_gen.passive1[1][0],
    cd: skillParam_gen.passive1[2][0],
  },
  passive2: {
    heal_: skillParam_gen.passive2[0][0],
    cryo_dmg_: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    healInterval: skillParam_gen.constellation1[0],
    heal: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2],
  },
  constellation2: {
    atk1: skillParam_gen.constellation2[0],
    atk2: skillParam_gen.constellation2[1],
    atk3: skillParam_gen.constellation2[2],
    duration: skillParam_gen.constellation2[3],
  },
  constellation4: {
    dmg_: skillParam_gen.constellation4[0],
    energyRegen: skillParam_gen.constellation4[1],
    cd: skillParam_gen.constellation4[2],
    triggers: skillParam_gen.constellation4[3],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    heal: skillParam_gen.constellation6[1],
    cd: skillParam_gen.constellation6[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { burst, ascension, constellation },
} = own
// WR cond(key, 'c4Marked'); lookup('c2Hit') keys '1'|'2'|'3'
const { c4Marked } = allBoolConditionals(info.key)
const { c2Hit } = allListConditionals(info.key, ['1', '2', '3'])

const numOtherFontainians = sum(team.common.count.fontaine, -1)
const numNonFontainians = sum(
  ...allRegionKeys
    .filter((region) => region !== 'fontaine')
    .map((region) => team.common.count[region])
)
const a4_heal_ = cmpGE(
  ascension,
  4,
  prod(numOtherFontainians, percent(dm.passive2.heal_))
)
const a4_cryo_dmg_ = cmpGE(
  ascension,
  4,
  prod(numNonFontainians, percent(dm.passive2.cryo_dmg_))
)
const c2Hit_atk_ = cmpGE(
  constellation,
  2,
  percent(
    c2Hit.map({
      '1': dm.constellation2.atk1,
      '2': dm.constellation2.atk2,
      '3': dm.constellation2.atk3,
    })
  )
)
const c4Marked_burst_dmg_ = c4Marked.ifOn(
  cmpGE(constellation, 4, percent(dm.constellation4.dmg_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Still Photo: Comprehensive Confirmation (burst); C5 Still Photo: Fast Follow-Up (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.heal_.add(a4_heal_),
  ownBuff.premod.dmg_.cryo.add(a4_cryo_dmg_),
  ownBuff.premod.atk_.add(c2Hit_atk_),
  ownBuff.premod.dmg_.burst.add(c4Marked_burst_dmg_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  dmg('thornDmg', info, 'atk', dm.charged.thornDmg, 'normal'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('photoPressDmg', info, 'atk', dm.skill.photoPressDmg, 'skill'),
  dmg('photoHoldDmg', info, 'atk', dm.skill.photoHoldDmg, 'skill'),
  dmg('snapMarkDmg', info, 'atk', dm.skill.snapMarkDmg, 'skill'),
  dmg('focusMarkDmg', info, 'atk', dm.skill.focusMarkDmg, 'skill'),
  customHeal(
    'castHeal',
    sum(
      prod(percent(talentSubscript(burst, dm.burst.castHealBase)), final.atk),
      talentSubscript(burst, dm.burst.castHealFlat)
    )
  ),
  dmg('burstDmg', info, 'atk', dm.burst.skillDmg, 'burst'),
  customHeal(
    'kameraHeal',
    sum(
      prod(percent(talentSubscript(burst, dm.burst.kameraHealBase)), final.atk),
      talentSubscript(burst, dm.burst.kameraHealFlat)
    )
  ),
  dmg('kameraDmg', info, 'atk', dm.burst.kameraDmg, 'burst'),
  customHeal('c1Heal', prod(percent(dm.constellation1.heal), final.atk), {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customDmg(
    'c6Dmg',
    info.ele,
    'burst',
    prod(percent(dm.constellation6.dmg), final.atk),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  ),
  customHeal('c6Heal', prod(percent(dm.constellation6.heal), final.atk), {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),

  customParam('charged_stam', dm.charged.stam),
  customParam('charged_thornInterval', dm.charged.thornInterval),
  customParam('skill_snapMarkInterval', dm.skill.snapMarkInterval),
  customParam('skill_snapMarkDuration', dm.skill.snapMarkDuration),
  customParam('skill_focusMarkInterval', dm.skill.focusMarkInterval),
  customParam('skill_focusMarkDuration', dm.skill.focusMarkDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('skill_finisherCd', dm.skill.finisherCd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)

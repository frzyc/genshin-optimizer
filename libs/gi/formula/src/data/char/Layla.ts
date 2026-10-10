import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allNumConditionals,
  customParam,
  customShield,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Layla'
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
    dmg1: skillParam_gen.auto[a++],
    dmg2: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    starDmg: skillParam_gen.skill[s++],
    shieldHp_: skillParam_gen.skill[s++],
    shieldBase: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    slugDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    energyCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    shield_: skillParam_gen.passive1[0][0],
    maxStacks: 4,
  },
  passive2: {
    starHpDmgInc: skillParam_gen.passive2[0][0],
  },
  constellation1: {
    shield_: skillParam_gen.constellation1[0],
    partyShield_: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2],
  },
  constellation4: {
    normalChargedDmgInc: skillParam_gen.constellation4[0],
    effectDuration: skillParam_gen.constellation4[1],
    removeAfter: skillParam_gen.constellation4[2],
  },
  constellation6: {
    starIntervalDec_: skillParam_gen.constellation6[0],
    starSlugDmg_: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'c4Active'); lookup('a1Stacks') → num 0–4
const { c4Active } = allBoolConditionals(info.key)
const { a1Stacks } = allNumConditionals(info.key, true, 0, 4)

const c1ShieldStr_ = sum(
  percent(1),
  cmpGE(constellation, 1, percent(dm.constellation1.shield_))
)
const skillShield = prod(
  c1ShieldStr_,
  sum(
    prod(percent(talentSubscript(skill, dm.skill.shieldHp_)), final.hp),
    talentSubscript(skill, dm.skill.shieldBase)
  )
)
const c1PartyShield = prod(percent(dm.constellation1.partyShield_), skillShield)

// WR dest-gated teamBuff.shield_ (activeCharKey).
const a1Shield_ = prod(
  cmpGE(ascension, 1, prod(a1Stacks, percent(dm.passive1.shield_))),
  destIsActive
)
// WR prod(% starHpDmgInc, total.hp). Read premod.hp@agg so formula.base cannot cycle.
const a4_starDmgInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.starHpDmgInc), own.premod.hp.sheet('agg'))
)
const c4_naCa_dmgInc = c4Active.ifOn(
  cmpGE(
    constellation,
    4,
    prod(percent(dm.constellation4.normalChargedDmgInc), final.hp)
  )
)
const c6_starSlug_dmg_ = cmpGE(
  constellation,
  6,
  percent(dm.constellation6.starSlugDmg_)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Light's Overflow (skill); C5 Stream of Consciousness (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  teamBuff.premod.shield_.add(a1Shield_),
  // WR teamBuff.premod.normal_dmgInc / charged_dmgInc (not dest-gated)
  teamBuff.formula.base.normal.add(c4_naCa_dmgInc),
  teamBuff.formula.base.charged.add(c4_naCa_dmgInc),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_2', info, 'atk', dm.charged.dmg2, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skillDmg', info, 'atk', dm.skill.skillDmg, 'skill'),
  dmg(
    'starDmg',
    info,
    'atk',
    dm.skill.starDmg,
    'skill',
    undefined,
    ownBuff.formula.base.add(a4_starDmgInc),
    ownBuff.premod.dmg_.skill.add(c6_starSlug_dmg_)
  ),
  customShield('skillShield', undefined, skillShield),
  customShield('skillCryoShield', 'cryo', skillShield),
  dmg(
    'slugDmg',
    info,
    'hp',
    dm.burst.slugDmg,
    'burst',
    undefined,
    ownBuff.premod.dmg_.burst.add(c6_starSlug_dmg_)
  ),
  customShield('c1PartyShield', undefined, c1PartyShield, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customShield('c1PartyCryoShield', 'cryo', c1PartyShield, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_shieldDuration', dm.skill.shieldDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.energyCost)
)

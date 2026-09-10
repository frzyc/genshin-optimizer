import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customDmg,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Emilie'
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
      skillParam_gen.auto[++a], // 3
      skillParam_gen.auto[++a], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    level1Dmg: skillParam_gen.skill[s++],
    level2Dmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    thornDmg: skillParam_gen.skill[s++],
    thornInterval: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    level3Dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg: skillParam_gen.passive1[0][0],
  },
  passive2: {
    burn_dmg_: skillParam_gen.passive2[0][0],
    max_burn_dmg_: skillParam_gen.passive2[1][0],
  },
  passive3: {
    burn_res_: skillParam_gen.passive3![0][0],
  },
  constellation1: {
    triggerInterval: skillParam_gen.constellation1[0],
    dmg_: skillParam_gen.constellation1[1],
  },
  constellation2: {
    dendro_enemyRes_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
  },
  constellation4: {
    durationInc: skillParam_gen.constellation4[0],
    triggerIntervalReduce: skillParam_gen.constellation4[1],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[0],
    maxTriggers: skillParam_gen.constellation6[1],
    dmg: skillParam_gen.constellation6[2],
    cd: skillParam_gen.constellation6[3],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'a4Burning' | 'c2Hit' | 'c6Fragrance')
const { a4Burning, c2Hit, c6Fragrance } = allBoolConditionals(info.key)

const a4_dmg_ = a4Burning.ifOn(
  cmpGE(
    ascension,
    4,
    min(
      prod(final.atk, 1 / 1000, percent(dm.passive2.burn_dmg_)),
      percent(dm.passive2.max_burn_dmg_)
    )
  )
)
const c1_skill_dmg_ = cmpGE(constellation, 1, percent(dm.constellation1.dmg_))
const c1_a1_dmg_ = cmpGE(
  constellation,
  1,
  cmpGE(ascension, 1, percent(dm.constellation1.dmg_))
)
const c2Hit_dendro_enemyRes_ = c2Hit.ifOn(
  cmpGE(constellation, 2, percent(-dm.constellation2.dendro_enemyRes_))
)
const c6InfusionOn = cmpGE(
  c6Fragrance.ifOn(cmpGE(constellation, 6, 1)),
  1,
  'infer',
  ''
)
const c6_naCa_dmgInc = c6Fragrance.ifOn(
  cmpGE(constellation, 6, prod(percent(dm.constellation6.dmg), final.atk))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Exquisite Essence (skill); C5 Puredew Aroma (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.add(a4_dmg_),
  ownBuff.premod.dmg_.skill.add(c1_skill_dmg_),
  // WR teamBuff.premod.dendro_enemyRes_ (not activeCharBuff); Pando enemy preRes.
  enemyDebuff.common.preRes.dendro.add(c2Hit_dendro_enemyRes_),
  // WR premod.normal_dmgInc / charged_dmgInc → formula.base (no flat dmgInc tag)
  ownBuff.formula.base.normal.add(c6_naCa_dmgInc),
  ownBuff.formula.base.charged.add(c6_naCa_dmgInc),
  // WR infusion.nonOverridableSelf dendro. infusionPrio has no dendro channel —
  // listing-local `{ ele: 'dendro' }` on c6Fragrance NA/CA/plunge.

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal'),
    ...dmg(`normal_${i}_dendro`, info, 'atk', arr, 'normal', {
      ele: 'dendro',
      cond: c6InfusionOn,
    }),
  ]),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  dmg('charged_dendro', info, 'atk', dm.charged.dmg, 'charged', {
    ele: 'dendro',
    cond: c6InfusionOn,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) => [
    ...dmg(`plunging_${k}`, info, 'atk', v, 'plunging'),
    ...dmg(`plunging_${k}_dendro`, info, 'atk', v, 'plunging', {
      ele: 'dendro',
      cond: c6InfusionOn,
    }),
  ]),
  dmg('skill', info, 'atk', dm.skill.skillDmg, 'skill'),
  dmg('skill_level1', info, 'atk', dm.skill.level1Dmg, 'skill'),
  dmg('skill_level2', info, 'atk', dm.skill.level2Dmg, 'skill'),
  // WR thornDmg sets hit.reaction to '' (Arkhe); Pando has no no-react overlay.
  dmg('skill_thorn', info, 'atk', dm.skill.thornDmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.level3Dmg, 'burst'),
  customDmg(
    'a1',
    'dendro',
    'elemental',
    prod(percent(dm.passive1.dmg), final.atk),
    { cond: cmpGE(ascension, 1, 'infer', '') },
    ownBuff.premod.dmg_.add(c1_a1_dmg_)
  ),
  customParam('a4_dmg_', a4_dmg_, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('c6_normal_dmgInc', c6_naCa_dmgInc, {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),
  customParam('c6_charged_dmgInc', c6_naCa_dmgInc, {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_thornInterval', dm.skill.thornInterval),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)

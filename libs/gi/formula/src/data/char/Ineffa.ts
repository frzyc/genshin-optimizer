import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, min, prod } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  customDmg,
  customParam,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, shield } from './util'

const key: CharacterKey = 'Ineffa'
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
      skillParam_gen.auto[++a], // 3.1
      skillParam_gen.auto[++a], // 3.2
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
    shieldMult: skillParam_gen.skill[s++],
    shieldFlat: skillParam_gen.skill[s++],
    birgittaDmg: skillParam_gen.skill[s++],
    // Encoding Shield Duration {{5}}, Birgitta Duration {{4}}. WR named these swapped.
    shieldDuration: skillParam_gen.skill[s++][0],
    birgittaDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg: skillParam_gen.passive1[0][0],
    3.5: skillParam_gen.passive1[1][0],
  },
  passive2: {
    eleMasFromAtk: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
  },
  passive3: {
    lunarcharged_base_dmg_per100: skillParam_gen.passive3![0][0],
    max: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    lunarcharged_dmg_: skillParam_gen.constellation1[0],
    max: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2],
  },
  constellation2: {
    dmg: skillParam_gen.constellation2[0],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    cd: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  premod,
  char: { ascension, constellation },
} = own
// WR cond(key, 'a4AfterBurst' | 'c1AfterShield')
const { a4AfterBurst, c1AfterShield } = allBoolConditionals(info.key)

const a0_base_lc_dmg_ = min(
  prod(final.atk, 1 / 100, percent(dm.passive3.lunarcharged_base_dmg_per100)),
  percent(dm.passive3.max)
)
// WR teamBuff.total.eleMas dest-gated to self OR active (Aino C1 destIsActive).
const a4AfterBurst_eleMasDisp = a4AfterBurst.ifOn(
  cmpGE(ascension, 4, prod(percent(dm.passive2.eleMasFromAtk), premod.atk))
)
const c1AfterShield_lc_dmg_ = c1AfterShield.ifOn(
  cmpGE(
    constellation,
    1,
    min(
      prod(final.atk, 1 / 100, percent(dm.constellation1.lunarcharged_dmg_)),
      percent(dm.constellation1.max)
    )
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Enhanced Emotion Emulator (skill); C5 Mirror's Dream Transcension (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // A0 Moonsign Benediction — WR teamBuff lunarcharged_baseDmg_ (no Pando baseDmg_ tag)
  teamBuff.premod.dmg_.lunarcharged.add(a0_base_lc_dmg_),
  // A4 — WR total.eleMas from premod.atk; dest self always + active teammate
  ownBuff.premod.eleMas.add(a4AfterBurst_eleMasDisp),
  notOwnBuff.premod.eleMas.add(cmpNE(destIsActive, 0, a4AfterBurst_eleMasDisp)),
  // C1 — WR teamBuff lunarcharged_dmg_
  teamBuff.premod.dmg_.lunarcharged.add(c1AfterShield_lc_dmg_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.skillDmg, 'skill'),
  shield(
    'skill_shield',
    'atk',
    dm.skill.shieldMult,
    dm.skill.shieldFlat,
    'skill'
  ),
  shield(
    'skill_electroShield',
    'atk',
    dm.skill.shieldMult,
    dm.skill.shieldFlat,
    'skill',
    { ele: 'electro' }
  ),
  dmg('skill_birgittaDmg', info, 'atk', dm.skill.birgittaDmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  // WR lunarDmgNode (special reaction ×3 / transDef / lunarcharged_*). No Pando lunarDmg.
  customDmg(
    'a1',
    info.ele,
    'elemental',
    prod(final.atk, percent(dm.passive1.dmg)),
    { cond: cmpGE(ascension, 1, 'infer', '') }
  ),
  customDmg(
    'c2',
    info.ele,
    'elemental',
    prod(final.atk, percent(dm.constellation2.dmg)),
    { cond: cmpGE(constellation, 2, 'infer', '') }
  ),
  customDmg(
    'c6',
    info.ele,
    'elemental',
    prod(final.atk, percent(dm.constellation6.dmg)),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  ),

  customParam('a0_base_lc_dmg_', a0_base_lc_dmg_),
  customParam('a4AfterBurst_eleMasDisp', a4AfterBurst_eleMasDisp, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('c1AfterShield_lc_dmg_', c1AfterShield_lc_dmg_, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customParam('charged_stam', dm.charged.stam),
  customParam('skill_shieldDuration', dm.skill.shieldDuration),
  customParam('skill_birgittaDuration', dm.skill.birgittaDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('c6_cd', dm.constellation6.cd, {
    cond: cmpGE(constellation, 6, 'infer', ''),
  })
)

import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customHeal,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  team,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Lyney'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[++a], // 3x2, skip one entry
      skillParam_gen.auto[++a],
    ],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  charged: {
    aimed: skillParam_gen.auto[++a],
    fullyAimed: skillParam_gen.auto[++a],
    propDmg: skillParam_gen.auto[++a],
    hpCost: skillParam_gen.auto[++a],
    hatHp: skillParam_gen.auto[++a],
    hatDuration: skillParam_gen.auto[++a][0],
    pyrotechnicDmg: skillParam_gen.auto[++a],
    thornDmg: skillParam_gen.auto[++a],
    thornInterval: skillParam_gen.auto[++a][0],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    dmgInc: skillParam_gen.skill[s++],
    hpRegen: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    fireworkDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    energy: skillParam_gen.passive1[0][0],
    propAddlDmg: skillParam_gen.passive1[1][0],
  },
  passive2: {
    dmg_: skillParam_gen.passive2[0][0],
    extraDmg_: skillParam_gen.passive2[1][0],
  },
  constellation2: {
    critDmg_: skillParam_gen.constellation2[0],
    stackCd: skillParam_gen.constellation2[1],
    maxStacks: skillParam_gen.constellation2[2],
  },
  constellation4: {
    enemy_pyro_res_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { auto, skill, ascension, constellation },
} = own
const { pyro: pyroCount } = team.common.count
// WR cond(key, 'propStacks') 1–5
const { propStacks } = allNumConditionals(info.key, true, 0, 5)
// WR cond(key, 'a1DrainHp' | 'a4AffectedByPyro' | 'c4Hit') `'on'`
const { a1DrainHp, a4AffectedByPyro, c4Hit } = allBoolConditionals(info.key)
// WR cond(key, 'c2Stacks') 1–maxStacks
const { c2Stacks } = allNumConditionals(
  info.key,
  true,
  0,
  dm.constellation2.maxStacks
)

const skillDmgInc = prod(
  propStacks,
  percent(talentSubscript(skill, dm.skill.dmgInc)),
  final.atk
)
const a1_hatDmgInc = a1DrainHp.ifOn(
  cmpGE(ascension, 1, prod(percent(dm.passive1.propAddlDmg), final.atk))
)
const numPyroOther = min(2, sum(pyroCount, -1))
const a4AffectedByPyro_dmg_ = a4AffectedByPyro.ifOn(
  cmpGE(
    ascension,
    4,
    sum(
      percent(dm.passive2.dmg_),
      prod(percent(dm.passive2.extraDmg_), numPyroOther)
    )
  )
)
const c2_critDMG_ = cmpGE(
  constellation,
  2,
  prod(percent(dm.constellation2.critDmg_), c2Stacks)
)
const c4_pyro_enemy_res_ = c4Hit.ifOn(
  cmpGE(constellation, 4, -dm.constellation4.enemy_pyro_res_)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Lightgrin (auto); C5 Burst
  ownBuff.char.auto.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.formula.base.skill.add(skillDmgInc),
  ownBuff.premod.dmg_.add(a4AffectedByPyro_dmg_),
  ownBuff.premod.critDMG_.add(c2_critDMG_),
  enemyDebuff.common.preRes.pyro.add(c4_pyro_enemy_res_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_fullyAimed', info, 'atk', dm.charged.fullyAimed, 'charged', {
    ele: 'pyro',
  }),
  dmg('charged_prop', info, 'atk', dm.charged.propDmg, 'charged', {
    ele: 'pyro',
  }),
  dmg(
    'charged_pyrotechnic',
    info,
    'atk',
    dm.charged.pyrotechnicDmg,
    'charged',
    { ele: 'pyro' },
    ownBuff.formula.base.add(a1_hatDmgInc)
  ),
  dmg('charged_spiritbreath', info, 'atk', dm.charged.thornDmg, 'charged', {
    ele: 'pyro',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  customHeal(
    'skill_hpRegen',
    prod(
      percent(talentSubscript(skill, dm.skill.hpRegen)),
      final.hp,
      propStacks
    )
  ),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  dmg('burst_firework', info, 'atk', dm.burst.fireworkDmg, 'burst'),
  dmg('c6', info, 'atk', dm.charged.pyrotechnicDmg, 'charged', {
    ele: 'pyro',
    baseMulti: percent(dm.constellation6.dmg),
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),

  customParam(
    'charged_hpCost',
    prod(percent(talentSubscript(auto, dm.charged.hpCost)), final.hp)
  ),
  customParam(
    'charged_hatHp',
    prod(percent(talentSubscript(auto, dm.charged.hatHp)), final.hp)
  ),
  customParam('charged_hatDuration', dm.charged.hatDuration),
  customParam('charged_thornInterval', dm.charged.thornInterval),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)

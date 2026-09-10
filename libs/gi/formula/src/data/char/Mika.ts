import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allNumConditionals,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Mika'
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
      skillParam_gen.auto[++a], // 4x2
      skillParam_gen.auto[(a += 2)], // 5
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
    arrowDmg: skillParam_gen.skill[s++],
    flareDmg: skillParam_gen.skill[s++],
    shardDmg: skillParam_gen.skill[s++],
    atkSPD_: skillParam_gen.skill[s++],
    soulwindDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    castHealBase: skillParam_gen.burst[b++],
    castHealHp: skillParam_gen.burst[b++],
    plumeHealBase: skillParam_gen.burst[b++],
    plumeHealHp: skillParam_gen.burst[b++],
    plumeInterval: skillParam_gen.burst[b++][0],
    plumeDuration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    energyCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    physical_dmg_: skillParam_gen.passive1[0][0],
    maxStacks: skillParam_gen.passive1[1][0],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    energyRegenProcs: skillParam_gen.constellation4[1],
  },
  constellation6: {
    physical_critDMG_: skillParam_gen.constellation6[0],
    extraStacks: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'inSoulwind' | 'c6Crit'); lookup('a1DetectorStacks') → num 0–5
const { inSoulwind, c6Crit } = allBoolConditionals(info.key)
const { a1DetectorStacks } = allNumConditionals(info.key, true, 0, 5)

// WR equal(activeCharKey, target.charKey, …) — dest-gated Soulwind.
const skillInSoulwind_atkSPD_ = prod(
  inSoulwind.ifOn(percent(talentSubscript(skill, dm.skill.atkSPD_))),
  destIsActive
)
// WR lookup: stacks 1–3 always; 4 needs A4|C6; 5 needs A4&C6. Max = 3 + A4 + C6.
const detectorMax = sum(
  dm.passive1.maxStacks,
  cmpGE(ascension, 4, 1),
  cmpGE(constellation, 6, 1)
)
const a1DetectorStacks_physical_dmg_ = prod(
  inSoulwind.ifOn(1),
  cmpGE(
    ascension,
    1,
    prod(
      cmpGE(detectorMax, a1DetectorStacks, 1),
      a1DetectorStacks,
      percent(dm.passive1.physical_dmg_)
    )
  ),
  destIsActive
)
const c6InSoulwind_physical_critDMG_ = prod(
  inSoulwind.ifOn(1),
  c6Crit.ifOn(
    cmpGE(constellation, 6, percent(dm.constellation6.physical_critDMG_))
  ),
  destIsActive
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Reconnaissance Experience (burst); C5 Signal Arrow (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  teamBuff.premod.atkSPD_.add(skillInSoulwind_atkSPD_),
  teamBuff.premod.dmg_.physical.add(a1DetectorStacks_physical_dmg_),
  teamBuff.premod.critDMG_.physical.add(c6InSoulwind_physical_critDMG_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('arrowDmg', info, 'atk', dm.skill.arrowDmg, 'skill'),
  dmg('flareDmg', info, 'atk', dm.skill.flareDmg, 'skill'),
  dmg('shardDmg', info, 'atk', dm.skill.shardDmg, 'skill'),
  customHeal(
    'castHeal',
    sum(
      prod(percent(talentSubscript(burst, dm.burst.castHealHp)), final.hp),
      talentSubscript(burst, dm.burst.castHealBase)
    )
  ),
  customHeal(
    'plumeHeal',
    sum(
      prod(percent(talentSubscript(burst, dm.burst.plumeHealHp)), final.hp),
      talentSubscript(burst, dm.burst.plumeHealBase)
    )
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_soulwindDuration', dm.skill.soulwindDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_plumeInterval', dm.burst.plumeInterval),
  customParam('burst_plumeDuration', dm.burst.plumeDuration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.energyCost)
)

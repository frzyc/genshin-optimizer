import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  customDmg,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Yaoyao'
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
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    heal_hp_: skillParam_gen.skill[s++],
    heal_base: skillParam_gen.skill[s++],
    throwDuration: skillParam_gen.skill[s++][0],
    radishDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    radish_dmg: skillParam_gen.burst[b++],
    radish_heal_hp: skillParam_gen.burst[b++],
    radish_heal_flat: skillParam_gen.burst[b++],
    skill_dmg: skillParam_gen.burst[b++],
    dendro_res_: skillParam_gen.burst[b++][0],
    moveSPD_: 0.15,
    legacyDuration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  // passive1: {
  //   cd: skillParam_gen.passive1[0][0]
  // },
  passive2: {
    cd: skillParam_gen.passive2[0][0],
    heal_hp: skillParam_gen.passive2[1][0],
    duration: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    duration: skillParam_gen.constellation1[0],
    dendro_dmg_: skillParam_gen.constellation1[1],
    staminaRestore: skillParam_gen.constellation1[2],
    cd: skillParam_gen.constellation1[3],
  },
  constellation2: {
    energyRegen: skillParam_gen.constellation2[0],
    cd: skillParam_gen.constellation2[1],
  },
  constellation4: {
    eleMas_Hp: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
    maxEleMas: skillParam_gen.constellation4[2],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    heal_hp: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'adeptalLegacy' | 'c1Explode' | 'c4AfterSkillBurst')
const { adeptalLegacy, c1Explode, c4AfterSkillBurst } = allBoolConditionals(
  info.key
)

const adeptalLegacy_dendro_res_ = adeptalLegacy.ifOn(
  percent(dm.burst.dendro_res_)
)
const adeptalLegacy_moveSPD_ = adeptalLegacy.ifOn(percent(dm.burst.moveSPD_))
const c1Explode_dendro_dmg_ = c1Explode.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.dendro_dmg_))
)
const c4AfterSkillBurst_eleMas = c4AfterSkillBurst.ifOn(
  cmpGE(
    constellation,
    4,
    min(
      prod(percent(dm.constellation4.eleMas_Hp), own.premod.hp),
      dm.constellation4.maxEleMas
    )
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Raphanus Sky Cluster (skill); C5 Moonjade Descent (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.res_.dendro.add(adeptalLegacy_dendro_res_),
  ownBuff.premod.moveSPD_.add(adeptalLegacy_moveSPD_),
  // WR teamBuff dendro_dmg_ gated to the on-fielder (activeCharKey === target).
  teamBuff.premod.dmg_.dendro.add(
    cmpNE(destIsActive, 0, c1Explode_dendro_dmg_)
  ),
  ownBuff.final.eleMas.add(c4AfterSkillBurst_eleMas),

  // Formulas
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
      prod(percent(talentSubscript(skill, dm.skill.heal_hp_)), final.hp),
      talentSubscript(skill, dm.skill.heal_base)
    )
  ),
  dmg('burst', info, 'atk', dm.burst.skill_dmg, 'burst'),
  dmg('burst_radish', info, 'atk', dm.burst.radish_dmg, 'burst'),
  customHeal(
    'burst_radishHeal',
    sum(
      prod(percent(talentSubscript(burst, dm.burst.radish_heal_hp)), final.hp),
      talentSubscript(burst, dm.burst.radish_heal_flat)
    )
  ),
  customHeal('a4_heal', prod(percent(dm.passive2.heal_hp), final.hp), {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customDmg(
    'c6',
    'dendro',
    'burst',
    prod(percent(dm.constellation6.dmg), final.atk),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  ),
  customHeal('c6_heal', prod(percent(dm.constellation6.heal_hp), final.hp), {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_throwDuration', dm.skill.throwDuration),
  customParam('skill_radishDuration', dm.skill.radishDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.legacyDuration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.cost),
  customParam('a4_cd', dm.passive2.cd, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('a4_duration', dm.passive2.duration, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('c1_staminaRestore', dm.constellation1.staminaRestore, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customParam('c4_eleMas', c4AfterSkillBurst_eleMas, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  })
)

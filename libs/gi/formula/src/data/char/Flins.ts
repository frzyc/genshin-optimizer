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
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Flins'
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
      skillParam_gen.auto[++a], // 5
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
    na1: skillParam_gen.skill[s++],
    na2: skillParam_gen.skill[s++],
    na3: skillParam_gen.skill[s++],
    na4: skillParam_gen.skill[s++], // x2
    na5: skillParam_gen.skill[s++],
    ca: skillParam_gen.skill[s++],
    spearstormDmg: skillParam_gen.skill[s++],
    spearstormCd: skillParam_gen.skill[s++][0],
    flameDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    middlePhaseLunarDmg: skillParam_gen.burst[b++],
    finalPhaseLunarDmg: skillParam_gen.burst[b++],
    enerCost: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    thunderDmg: skillParam_gen.burst[b++],
    thunderAddlDmg: skillParam_gen.burst[b++],
    thunderEnerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    lunarcharged_dmg_: skillParam_gen.passive1[0][0],
  },
  passive2: {
    eleMasPercent: skillParam_gen.passive2[0][0],
    maxEleMas: skillParam_gen.passive2[1][0],
  },
  passive3: {
    lunarcharged_base_dmg_per100: skillParam_gen.passive3![0][0],
    max: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    dmg: skillParam_gen.constellation2[0],
    dmgDuration: skillParam_gen.constellation2[1],
    electro_enemyRes_: -skillParam_gen.constellation2[2],
    resDuration: skillParam_gen.constellation2[3],
  },
  constellation4: {
    atk_: skillParam_gen.constellation4[0],
    newEleMasPercent: skillParam_gen.constellation4[1],
    newMaxEleMas: skillParam_gen.constellation4[2],
  },
  constellation6: {
    lunarcharged_specialDmg_: skillParam_gen.constellation6[0],
    team_lunarcharged_specialDmg_: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  premod,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'c2AfterElectro')
const { c2AfterElectro } = allBoolConditionals(info.key)

const a0_base_lc_dmg_ = min(
  prod(final.atk, 1 / 100, percent(dm.passive3.lunarcharged_base_dmg_per100)),
  percent(dm.passive3.max)
)
const a1_lunarcharged_dmg_ = cmpGE(
  ascension,
  1,
  cmpGE(team.common.moonsign, 2, percent(dm.passive1.lunarcharged_dmg_))
)
const a4_eleMas = cmpGE(
  ascension,
  4,
  min(
    prod(percent(dm.passive2.eleMasPercent), premod.atk),
    dm.passive2.maxEleMas
  )
)
const c2_electro_enemyRes_ = c2AfterElectro.ifOn(
  cmpGE(
    constellation,
    2,
    cmpGE(team.common.moonsign, 2, percent(dm.constellation2.electro_enemyRes_))
  )
)
const c4_atk_ = cmpGE(constellation, 4, percent(dm.constellation4.atk_))
const c4_eleMas = cmpGE(
  ascension,
  4,
  cmpGE(
    constellation,
    4,
    min(
      prod(
        percent(dm.constellation4.newEleMasPercent - dm.passive2.eleMasPercent),
        premod.atk
      ),
      dm.constellation4.newMaxEleMas - dm.passive2.maxEleMas
    )
  )
)
const c6_lunarcharged_specialDmg_ = cmpGE(
  constellation,
  6,
  percent(dm.constellation6.lunarcharged_specialDmg_)
)
const c6_team_lunarcharged_specialDmg_ = cmpGE(
  constellation,
  6,
  cmpGE(
    team.common.moonsign,
    2,
    percent(dm.constellation6.team_lunarcharged_specialDmg_)
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Ancient Ritual: Cometh the Night (burst); C5 Ancient Rite: Arcane Light (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  // A1 Symphony of Winter — WR lunarcharged_dmg_ at moonsign 2
  ownBuff.premod.dmg_.lunarcharged.add(a1_lunarcharged_dmg_),
  // A4 Whispering Flame — WR total.eleMas from premod.atk
  ownBuff.premod.eleMas.add(a4_eleMas),
  // A0 Moonsign Benediction — WR teamBuff lunarcharged_baseDmg_ (no Pando baseDmg_ tag)
  teamBuff.premod.dmg_.lunarcharged.add(a0_base_lc_dmg_),
  // C2 Electro RES shred — WR teamBuff.premod.electro_enemyRes_; keep sign
  enemyDebuff.common.preRes.electro.add(c2_electro_enemyRes_),
  ownBuff.premod.atk_.add(c4_atk_),
  ownBuff.premod.eleMas.add(c4_eleMas),
  // C6 — WR lunarcharged_specialDmg_ (no Pando specialDmg_ tag)
  ownBuff.premod.dmg_.lunarcharged.add(c6_lunarcharged_specialDmg_),
  teamBuff.premod.dmg_.lunarcharged.add(c6_team_lunarcharged_specialDmg_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  // WR dmgNode(..., electroInfusion, undefined, 'skill'): infusion.nonOverridableSelf
  // data() overlay + skill talent. Pando stamps ele + skill talent; no Manifest Flame cond.
  (['na1', 'na2', 'na3', 'na4', 'na5'] as const).flatMap((k) =>
    customDmg(
      `skill_${k}`,
      info.ele,
      'normal',
      prod(final.atk, percent(talentSubscript(skill, dm.skill[k])))
    )
  ),
  customDmg(
    'skill_ca',
    info.ele,
    'charged',
    prod(final.atk, percent(talentSubscript(skill, dm.skill.ca)))
  ),
  dmg('skill_spearDmg', info, 'atk', dm.skill.spearstormDmg, 'skill'),
  dmg('burst_skillDmg', info, 'atk', dm.burst.skillDmg, 'burst'),
  // WR lunarDmgNode (special reaction ×3 / transDef / lunarcharged_*). No Pando lunarDmg.
  customDmg(
    'burst_middleLunarDmg',
    info.ele,
    'burst',
    prod(
      final.atk,
      percent(talentSubscript(burst, dm.burst.middlePhaseLunarDmg))
    )
  ),
  customDmg(
    'burst_finalLunarDmg',
    info.ele,
    'burst',
    prod(
      final.atk,
      percent(talentSubscript(burst, dm.burst.finalPhaseLunarDmg))
    )
  ),
  customDmg(
    'burst_thunderDmg',
    info.ele,
    'burst',
    prod(final.atk, percent(talentSubscript(burst, dm.burst.thunderDmg)))
  ),
  customDmg(
    'burst_thunderAddlDmg',
    info.ele,
    'burst',
    prod(final.atk, percent(talentSubscript(burst, dm.burst.thunderAddlDmg)))
  ),
  customDmg(
    'c2',
    info.ele,
    'elemental',
    prod(final.atk, percent(dm.constellation2.dmg)),
    { cond: cmpGE(constellation, 2, 'infer', '') }
  ),

  customParam('a4_eleMas', a4_eleMas, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('a0_base_lc_dmg_', a0_base_lc_dmg_),
  customParam('c4_eleMas', c4_eleMas, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customParam('charged_stam', dm.charged.stam),
  customParam('skill_spearstormCd', dm.skill.spearstormCd),
  customParam('skill_flameDuration', dm.skill.flameDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_thunderEnerCost', dm.burst.thunderEnerCost)
)

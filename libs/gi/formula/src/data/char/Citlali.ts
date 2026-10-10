import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  enemyDebuff,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, shield } from './util'

const key: CharacterKey = 'Citlali'
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
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    obsidianDmg: skillParam_gen.skill[s++],
    shieldMult: skillParam_gen.skill[s++],
    shieldBase: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    frostfallStormDmg: skillParam_gen.skill[s++],
    initialNs: skillParam_gen.skill[s++][0],
    nsConsumption: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    nsLimit: skillParam_gen.skill[s++][0],
  },
  burst: {
    iceStormDmg: skillParam_gen.burst[b++],
    skullDmg: skillParam_gen.burst[b++],
    iceStormNsGain: skillParam_gen.burst[b++][0],
    skullNsGain: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    nsGain: skillParam_gen.passive1[0][0],
    cd: skillParam_gen.passive1[1][0],
    pyroHydro_enemyRes_: skillParam_gen.passive1[2][0],
    duration: skillParam_gen.passive1[3][0],
  },
  passive2: {
    frostfallStorm_dmgInc: skillParam_gen.passive2[0][0],
    iceStorm_dmgInc: skillParam_gen.passive2[1][0],
    nsGain: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    dmgInc: skillParam_gen.constellation1[0],
    triggerQuota: skillParam_gen.constellation1[1],
    addlTrigger: skillParam_gen.constellation1[2],
    cd: skillParam_gen.constellation1[3],
    phlogDec: skillParam_gen.constellation1[4],
  },
  constellation2: {
    selfEleMas: skillParam_gen.constellation2[0],
    teamEleMas: skillParam_gen.constellation2[1],
    shieldMultMaybe: skillParam_gen.constellation2[2],
    pyroHydro_enemyRes_: skillParam_gen.constellation2[3],
    duration: skillParam_gen.constellation2[4],
  },
  constellation4: {
    dmg: skillParam_gen.constellation4[0],
    nsGain: skillParam_gen.constellation4[1],
    energyRestore: skillParam_gen.constellation4[2],
    cd: skillParam_gen.constellation4[3],
  },
  constellation6: {
    pyro_dmg_: skillParam_gen.constellation6[0],
    hydro_dmg_: skillParam_gen.constellation6[1],
    all_dmg_: skillParam_gen.constellation6[2],
    maxStacks: skillParam_gen.constellation6[3],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'a1NsFreezeMelt' | 'c1BladeConsume' | 'c2ShieldEleMas')
const { a1NsFreezeMelt, c1BladeConsume, c2ShieldEleMas } = allBoolConditionals(
  info.key
)
// WR lookup(cond(key, 'c6NsConsumed'), 2..max step max/20 → n, else 0)
const { c6NsConsumed } = allNumConditionals(
  info.key,
  true,
  0,
  dm.constellation6.maxStacks
)

const a1NsFreezeMelt_pyro_enemyRes_ = a1NsFreezeMelt.ifOn(
  cmpGE(ascension, 1, percent(-dm.passive1.pyroHydro_enemyRes_))
)
const a1NsFreezeMelt_hydro_enemyRes_ = a1NsFreezeMelt.ifOn(
  cmpGE(ascension, 1, percent(-dm.passive1.pyroHydro_enemyRes_))
)
// WR C2 wraps the A1 shred node (same amount, extra copy) rather than
// dm.constellation2.pyroHydro_enemyRes_.
const c2NsFreezeMelt_pyro_enemyRes_ = cmpGE(
  constellation,
  2,
  a1NsFreezeMelt_pyro_enemyRes_
)
const c2NsFreezeMelt_hydro_enemyRes_ = cmpGE(
  constellation,
  2,
  a1NsFreezeMelt_hydro_enemyRes_
)

const a4FrostfallStorm_dmgInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.frostfallStorm_dmgInc), final.eleMas)
)
const a4IceStorm_dmgInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.iceStorm_dmgInc), final.eleMas)
)

const c1BladeConsume_dmgIncDisp = c1BladeConsume.ifOn(
  cmpGE(constellation, 1, prod(percent(dm.constellation1.dmgInc), final.eleMas))
)

const c2EleMas = cmpGE(constellation, 2, dm.constellation2.selfEleMas)
const c2ShieldEleMas_disp = c2ShieldEleMas.ifOn(
  cmpGE(constellation, 2, dm.constellation2.teamEleMas)
)

const c6NsConsumed_pyro_dmg_ = cmpGE(
  constellation,
  6,
  prod(c6NsConsumed, percent(dm.constellation6.pyro_dmg_))
)
const c6NsConsumed_hydro_dmg_ = cmpGE(
  constellation,
  6,
  prod(c6NsConsumed, percent(dm.constellation6.hydro_dmg_))
)
const c6NsConsumed_all_dmg_ = cmpGE(
  constellation,
  6,
  prod(c6NsConsumed, percent(dm.constellation6.all_dmg_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Dawnfrost Darkstar (skill); C5 Edict of Entwined Splendor (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.eleMas.add(c2EleMas),
  ownBuff.premod.dmg_.add(c6NsConsumed_all_dmg_),
  // WR teamBuff pyro/hydro_dmg_ (whole party, includes self).
  teamBuff.premod.dmg_.pyro.add(c6NsConsumed_pyro_dmg_),
  teamBuff.premod.dmg_.hydro.add(c6NsConsumed_hydro_dmg_),
  // WR unequal(target.charKey, key) — teammates only, not dest-gated.
  notOwnBuff.formula.base.normal.add(c1BladeConsume_dmgIncDisp),
  notOwnBuff.formula.base.charged.add(c1BladeConsume_dmgIncDisp),
  notOwnBuff.formula.base.plunging.add(c1BladeConsume_dmgIncDisp),
  notOwnBuff.formula.base.skill.add(c1BladeConsume_dmgIncDisp),
  notOwnBuff.formula.base.burst.add(c1BladeConsume_dmgIncDisp),
  // WR unequal(self) + equal(target, activeCharKey).
  notOwnBuff.premod.eleMas.add(cmpNE(destIsActive, 0, c2ShieldEleMas_disp)),
  enemyDebuff.common.preRes.pyro.add(
    sum(a1NsFreezeMelt_pyro_enemyRes_, c2NsFreezeMelt_pyro_enemyRes_)
  ),
  enemyDebuff.common.preRes.hydro.add(
    sum(a1NsFreezeMelt_hydro_enemyRes_, c2NsFreezeMelt_hydro_enemyRes_)
  ),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('obsidianDmg', info, 'atk', dm.skill.obsidianDmg, 'skill'),
  // WR dmgNode overlay premod.skill_dmgInc on this listing only (Nahida extras).
  dmg(
    'frostfallStormDmg',
    info,
    'atk',
    dm.skill.frostfallStormDmg,
    'skill',
    undefined,
    ownBuff.formula.base.add(a4FrostfallStorm_dmgInc)
  ),
  shield(
    'skill_shield',
    'eleMas',
    dm.skill.shieldMult,
    dm.skill.shieldBase,
    'skill'
  ),
  shield(
    'skill_shieldCryo',
    'eleMas',
    dm.skill.shieldMult,
    dm.skill.shieldBase,
    'skill',
    { ele: 'cryo' }
  ),
  // WR dmgNode overlay premod.burst_dmgInc on this listing only (Nahida extras).
  dmg(
    'iceStormDmg',
    info,
    'atk',
    dm.burst.iceStormDmg,
    'burst',
    undefined,
    ownBuff.formula.base.add(a4IceStorm_dmgInc)
  ),
  dmg('skullDmg', info, 'atk', dm.burst.skullDmg, 'burst'),
  customDmg(
    'c4',
    info.ele,
    'elemental',
    prod(percent(dm.constellation4.dmg), final.eleMas),
    { cond: cmpGE(constellation, 4, 'infer', '') }
  ),
  customParam('a4FrostfallStorm_dmgInc', a4FrostfallStorm_dmgInc, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('a4IceStorm_dmgInc', a4IceStorm_dmgInc, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('c1_normal_dmgInc', c1BladeConsume_dmgIncDisp, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customParam('c1_charged_dmgInc', c1BladeConsume_dmgIncDisp, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customParam('c1_plunging_dmgInc', c1BladeConsume_dmgIncDisp, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customParam('c1_skill_dmgInc', c1BladeConsume_dmgIncDisp, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customParam('c1_burst_dmgInc', c1BladeConsume_dmgIncDisp, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_shieldDuration', dm.skill.shieldDuration),
  customParam('skill_nsConsumption', dm.skill.nsConsumption),
  customParam('skill_nsLimit', dm.skill.nsLimit),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_iceStormNsGain', dm.burst.iceStormNsGain),
  customParam('burst_skullNsGain', dm.burst.skullNsGain),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)

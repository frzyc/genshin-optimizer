import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  cmpEq,
  cmpGE,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customDmg,
  customHeal,
  customParam,
  enemyDebuff,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Escoffier'
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
    parfaitDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    bladeDmg: skillParam_gen.skill[s++],
    bladeInterval: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    healPercent: skillParam_gen.burst[b++],
    healFlat: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    heal: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    cryoRes_: [
      0,
      -skillParam_gen.passive2[0][0],
      -skillParam_gen.passive2[1][0],
      -skillParam_gen.passive2[2][0],
      -skillParam_gen.passive2[3][0],
    ],
    duration: skillParam_gen.passive2[4][0],
  },
  constellation1: {
    cryo_critDMG_: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
  },
  constellation2: {
    duration: skillParam_gen.constellation2[0],
    dmgInc: skillParam_gen.constellation2[1],
    triggerQuota: skillParam_gen.constellation2[2],
  },
  constellation4: {
    durationInc: skillParam_gen.constellation4[0],
    energyRestore: skillParam_gen.constellation4[1],
    triggerQuota: skillParam_gen.constellation4[2],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    cd: skillParam_gen.constellation6[1],
    triggerQuota: skillParam_gen.constellation6[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { burst, ascension, constellation },
} = own
// WR cond(key, 'a4SkillBurstHit' | 'c1AfterSkillBurst' | 'c2Stacks')
const { a4SkillBurstHit, c1AfterSkillBurst, c2Stacks } = allBoolConditionals(
  info.key
)

const hydroCryoTeammates = sum(team.common.count.hydro, team.common.count.cryo)
const a4SkillBurstHit_enemyRes_ = a4SkillBurstHit.ifOn(
  cmpGE(
    ascension,
    4,
    percent(subscript(hydroCryoTeammates, [...dm.passive2.cryoRes_]))
  )
)
const c1AfterSkillBurst_cryo_critDMG_ = c1AfterSkillBurst.ifOn(
  cmpGE(
    constellation,
    1,
    cmpGE(
      ascension,
      4,
      cmpEq(hydroCryoTeammates, 4, percent(dm.constellation1.cryo_critDMG_))
    )
  )
)
// WR teamBuff.premod.cryo_dmgInc = prod(% dmgInc, total.atk). dest ≠ source.
const c2Stacks_cryo_dmgIncDisp = c2Stacks.ifOn(
  cmpGE(constellation, 2, prod(percent(dm.constellation2.dmgInc), final.atk))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Low-Temperature Cooking (skill); C5 Scoring Cuts (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // WR teamBuff.premod.cryo_enemyRes_ / hydro_enemyRes_ (keep sign)
  enemyDebuff.common.preRes.cryo.add(a4SkillBurstHit_enemyRes_),
  enemyDebuff.common.preRes.hydro.add(a4SkillBurstHit_enemyRes_),
  teamBuff.premod.critDMG_.cryo.add(c1AfterSkillBurst_cryo_critDMG_),
  // WR unequal(target.charKey, key); kit text also says on-fielder, WR does not dest-gate.
  notOwnBuff.formula.base.cryo.add(c2Stacks_cryo_dmgIncDisp),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.skillDmg, 'skill'),
  dmg('parfaitDmg', info, 'atk', dm.skill.parfaitDmg, 'skill'),
  // WR bladeDmg sets hit.reaction to '' (Arkhe); Pando has no no-react overlay.
  dmg('bladeDmg', info, 'atk', dm.skill.bladeDmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  customHeal(
    'burst_heal',
    sum(
      prod(percent(talentSubscript(burst, dm.burst.healPercent)), final.atk),
      talentSubscript(burst, dm.burst.healFlat)
    )
  ),
  customHeal('a1_heal', prod(percent(dm.passive1.heal), final.atk), {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customDmg(
    'c6',
    info.ele,
    'skill',
    prod(percent(dm.constellation6.dmg), final.atk),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  ),
  customParam('c2Stacks_cryo_dmgInc', c2Stacks_cryo_dmgIncDisp, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_bladeInterval', dm.skill.bladeInterval),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)

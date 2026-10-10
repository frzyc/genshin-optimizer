import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  cmpEq,
  cmpGE,
  cmpNE,
  min,
  prod,
  sum,
} from '@genshin-optimizer/pando/engine'
import { destIsActive, isActive } from '../common/conds'
import {
  allBoolConditionals,
  customParam,
  enemyDebuff,
  hexereiTally,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  team,
  teamBuff,
} from '../util'
import {
  dataGenToCharInfo,
  dmg,
  entriesForChar,
  shield,
  talentSubscript,
} from './util'

const key: CharacterKey = 'Nicole'
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
    skillDmg: skillParam_gen.skill[s++],
    shieldMult: skillParam_gen.skill[s++],
    shieldFlat: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    atkRatio: skillParam_gen.skill[s++],
    maxAtk: skillParam_gen.skill[s++],
    graceDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    projectionDmg: skillParam_gen.burst[b++],
    projectionCount: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
    fieldTime: skillParam_gen.passive1[1][0],
    atk: skillParam_gen.passive1[2][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
  },
  passive3: {
    cd: skillParam_gen.passive3![0][0],
  },
  lockedPassive: {
    projection_dmgInc: skillParam_gen.lockedPassive![0][0],
  },
  constellation1: {
    dmg: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    atk: skillParam_gen.constellation2[0],
    ele_enemyRes_: -skillParam_gen.constellation2[1],
  },
  constellation4: {
    duration: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
    dmgInc: skillParam_gen.constellation4[2],
    triggerQuota: skillParam_gen.constellation4[3],
  },
  constellation6: {
    enemyDefIgn_: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'lockHomework' | 'skillGraceActive' | 'a1GuidanceActive' | 'a4NicoleGuidance' | 'c4Pathfinder')
const {
  lockHomework,
  skillGraceActive,
  a1GuidanceActive,
  a4NicoleGuidance,
  c4Pathfinder,
} = allBoolConditionals(info.key)

// WR uses input.premod.atk so teamBuff.total.atk cannot cycle. Write final.atk.
const skillGraceActive_atk = skillGraceActive.ifOn(
  min(
    prod(
      percent(talentSubscript(skill, dm.skill.atkRatio)),
      own.premod.atk.sheet('agg')
    ),
    talentSubscript(skill, dm.skill.maxAtk)
  )
)
const a1GuidanceActive_atkDisp = cmpGE(
  ascension,
  1,
  skillGraceActive.ifOn(a1GuidanceActive.ifOn(dm.passive1.atk))
)
// WR any(disp, destIsActive, C6 ∧ (teammate ∧ a4 ∨ Nicole active)).
const a1GuidanceActive_atk = prod(a1GuidanceActive_atkDisp, destIsActive)
const a1GuidanceC6OffField = prod(
  a1GuidanceActive_atkDisp,
  cmpEq(destIsActive, 0, 1),
  cmpGE(
    constellation,
    6,
    cmpGE(sum(a4NicoleGuidance.ifOn(1), isActive.ifOn(1)), 1, 1)
  )
)
// WR own total.atk: A4 Guidance while Nicole is off-field.
const a4NicoleGuidanceActive_atk = cmpGE(
  ascension,
  4,
  skillGraceActive.ifOn(a4NicoleGuidance.ifOn(isActive.ifOff(dm.passive1.atk)))
)
const c2GraceActive_atk = cmpGE(
  constellation,
  2,
  skillGraceActive.ifOn(dm.constellation2.atk)
)

function c2GuidanceEleRes_(ele: ElementKey) {
  // WR active.charEle → team.common.activeEle; inactive1/2/3.charEle → count − active.
  const activeEleGate = a1GuidanceActive.ifOn(
    cmpNE(team.common.activeEle[ele], 0, 1)
  )
  const inactiveEleGate = cmpGE(
    constellation,
    6,
    a4NicoleGuidance.ifOn(
      cmpGE(
        sum(team.common.count[ele], prod(-1, team.common.activeEle[ele])),
        1,
        1
      )
    )
  )
  const nicoleOffPyroGate = ele === 'pyro' ? a4NicoleGuidance.ifOn(1) : 0
  return cmpGE(
    constellation,
    2,
    skillGraceActive.ifOn(
      cmpGE(
        sum(activeEleGate, inactiveEleGate, nicoleOffPyroGate),
        1,
        percent(dm.constellation2.ele_enemyRes_)
      )
    )
  )
}

const c4Pathfinder_dmgInc = cmpGE(
  constellation,
  4,
  c4Pathfinder.ifOn(prod(percent(dm.constellation4.dmgInc), final.atk))
)

const c6Guidance_enemyDefIgn_disp = cmpGE(
  constellation,
  6,
  skillGraceActive.ifOn(
    cmpGE(
      sum(a1GuidanceActive.ifOn(1), a4NicoleGuidance.ifOn(1)),
      1,
      percent(dm.constellation6.enemyDefIgn_)
    )
  )
)
// WR any(disp, a1 ∧ destIsActive, a4).
const c6Guidance_enemyDefIgn_ = prod(
  c6Guidance_enemyDefIgn_disp,
  cmpGE(
    sum(a1GuidanceActive.ifOn(destIsActive), a4NicoleGuidance.ifOn(1)),
    1,
    1
  )
)

const hexereiOn = lockHomework.ifOn(1)
const projectionDmgInc = lockHomework.ifOn(
  cmpGE(
    team.common.hexerei,
    2,
    prod(percent(dm.lockedPassive.projection_dmgInc), final.atk)
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // WR flags.isHexerei
  hexereiTally(hexereiOn),
  // C3 Revelation: Uncreated Light (skill); C5 Revelation: Ladder of Divine Ascent (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // WR teamBuff.total.atk / own total.atk
  teamBuff.final.atk.add(skillGraceActive_atk),
  teamBuff.final.atk.add(a1GuidanceActive_atk),
  notOwnBuff.final.atk.add(a1GuidanceC6OffField),
  ownBuff.final.atk.add(a4NicoleGuidanceActive_atk),
  teamBuff.final.atk.add(c2GraceActive_atk),

  // WR teamBuff.premod.{ele}_enemyRes_ (keep sign)
  ...allElementKeys.map((ele) =>
    enemyDebuff.common.preRes[ele].add(c2GuidanceEleRes_(ele))
  ),

  // WR teamBuff.premod.*_dmgInc → formula.base (no flat dmgInc tag)
  teamBuff.formula.base.normal.add(c4Pathfinder_dmgInc),
  teamBuff.formula.base.charged.add(c4Pathfinder_dmgInc),
  teamBuff.formula.base.plunging.add(c4Pathfinder_dmgInc),
  teamBuff.formula.base.skill.add(c4Pathfinder_dmgInc),
  teamBuff.formula.base.burst.add(c4Pathfinder_dmgInc),

  // WR teamBuff.premod.enemyDefIgn_
  enemyDebuff.common.defIgn.add(c6Guidance_enemyDefIgn_),

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
    'skill_pyroShield',
    'atk',
    dm.skill.shieldMult,
    dm.skill.shieldFlat,
    'skill',
    { ele: 'pyro' }
  ),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  // WR burst/C1 Arcane Projection listings are lookup + data() overlays on
  // every char in dataUtil.tsx (findNicoleData / customDmgNode premod.all_dmgInc).
  // Escalated — not registered here.
  customParam('skillGraceActive_atk', skillGraceActive_atk),
  customParam('projectionDmgInc', projectionDmgInc),
  customParam('c4Pathfinder_normal_dmgInc', c4Pathfinder_dmgInc, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customParam('c4Pathfinder_charged_dmgInc', c4Pathfinder_dmgInc, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customParam('c4Pathfinder_plunging_dmgInc', c4Pathfinder_dmgInc, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customParam('c4Pathfinder_skill_dmgInc', c4Pathfinder_dmgInc, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customParam('c4Pathfinder_burst_dmgInc', c4Pathfinder_dmgInc, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  })
)

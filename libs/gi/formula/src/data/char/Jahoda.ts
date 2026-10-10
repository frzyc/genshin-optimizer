import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  target,
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Jahoda'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2x2
      skillParam_gen.auto[a++], // 3
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    fullyAimed: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    bombDmg: skillParam_gen.skill[s++],
    unfilledDmg: skillParam_gen.skill[s++],
    filledDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    meowDmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    unknown2: skillParam_gen.skill[s++][0],
    unknown105: skillParam_gen.skill[s++][0],
    energyRegen: skillParam_gen.skill[s++][0],
    energyRegenCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    robotDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    robotHealMult: skillParam_gen.burst[b++],
    robotHealFlat: skillParam_gen.burst[b++],
    lowestHealMult: skillParam_gen.burst[b++],
    lowestHealFlat: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    unknown24: skillParam_gen.burst[b++][0],
    unknown15: skillParam_gen.burst[b++][0],
  },
  passive1: {
    robot_dmg_mult_: skillParam_gen.passive1[0][0],
    robot_heal_mult_: skillParam_gen.passive1[1][0],
    robot_attackInterval: skillParam_gen.passive1[2][0],
  },
  passive2: {
    eleMas: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    chance: skillParam_gen.constellation1[0],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
  },
  constellation6: {
    critRate_: skillParam_gen.constellation6[0],
    critDMG_: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { burst, ascension, constellation },
} = own
// WR cond(key, 'a4Heal' | 'c6FlaskFull')
const { a4Heal, c6FlaskFull } = allBoolConditionals(info.key)

const pyro = team.common.count.pyro
const hydro = team.common.count.hydro
const electro = team.common.count.electro
const cryo = team.common.count.cryo
// WR highestTeamElement / secondHighestTeamElement: threshold + compareEq /
// equalStr / greaterEqStr (stringPrio). Numeric count translation; tie order
// pyro > hydro > electro > cryo.
const pyroHighest = prod(
  cmpGE(
    sum(cmpGE(pyro, hydro, 1), cmpGE(pyro, electro, 1), cmpGE(pyro, cryo, 1)),
    3,
    1
  ),
  cmpGE(pyro, 1, 1)
)
const hydroHighest = prod(
  cmpNE(pyroHighest, 0, 0, 1),
  cmpGE(sum(cmpGE(hydro, electro, 1), cmpGE(hydro, cryo, 1)), 2, 1),
  cmpGE(hydro, 1, 1)
)
const electroHighest = prod(
  cmpNE(pyroHighest, 0, 0, 1),
  cmpNE(hydroHighest, 0, 0, 1),
  cmpGE(electro, cryo, 1),
  cmpGE(electro, 1, 1)
)
const cryoHighest = prod(
  cmpNE(pyroHighest, 0, 0, 1),
  cmpNE(hydroHighest, 0, 0, 1),
  cmpNE(electroHighest, 0, 0, 1)
)
const c2Second = prod(
  cmpGE(constellation, 2, 1),
  cmpGE(team.common.moonsign, 2, 1)
)
const pyroSecond = prod(
  c2Second,
  sum(
    prod(
      hydroHighest,
      cmpGE(sum(cmpGE(pyro, electro, 1), cmpGE(pyro, cryo, 1)), 2, 1),
      cmpGE(pyro, 1, 1)
    ),
    prod(
      electroHighest,
      cmpGE(sum(cmpGE(pyro, hydro, 1), cmpGE(pyro, cryo, 1)), 2, 1),
      cmpGE(pyro, 1, 1)
    ),
    prod(
      cryoHighest,
      cmpGE(sum(cmpGE(pyro, hydro, 1), cmpGE(pyro, electro, 1)), 2, 1),
      cmpGE(pyro, 1, 1)
    )
  )
)
const hydroSecond = prod(
  c2Second,
  sum(
    prod(
      pyroHighest,
      cmpGE(sum(cmpGE(hydro, electro, 1), cmpGE(hydro, cryo, 1)), 2, 1),
      cmpGE(hydro, 1, 1)
    ),
    // WR else after pyro takes PHC / PHE (tie order pyro > hydro)
    prod(
      electroHighest,
      cmpNE(pyroSecond, 0, 0, 1),
      cmpGE(hydro, cryo, 1),
      cmpGE(hydro, 1, 1)
    ),
    prod(
      cryoHighest,
      cmpNE(pyroSecond, 0, 0, 1),
      cmpGE(hydro, electro, 1),
      cmpGE(hydro, 1, 1)
    )
  )
)
const a1_pyro_robot_dmg_mult_ = sum(
  1,
  cmpGE(
    ascension,
    1,
    cmpGE(sum(pyroHighest, pyroSecond), 1, dm.passive1.robot_dmg_mult_ - 1)
  )
)
const a1_hydro_robot_heal_mult_ = sum(
  1,
  cmpGE(
    ascension,
    1,
    cmpGE(sum(hydroHighest, hydroSecond), 1, dm.passive1.robot_heal_mult_ - 1)
  )
)
const gleam = cmpGE(team.common.moonsign, 2, 1)

// WR equal(activeCharKey, target.charKey, …)
const a4Heal_eleMas = prod(
  a4Heal.ifOn(cmpGE(ascension, 4, dm.passive2.eleMas)),
  destIsActive
)
// WR equal(target.flags.isMoonsign, 1, …); dest moonsign via own.common.moonsign.
const c6FlaskFull_critRate_ = prod(
  c6FlaskFull.ifOn(
    cmpGE(
      constellation,
      6,
      cmpGE(team.common.moonsign, 2, percent(dm.constellation6.critRate_))
    )
  ),
  cmpGE(target.common.moonsign, 1, 1)
)
const c6FlaskFull_critDMG_ = prod(
  c6FlaskFull.ifOn(
    cmpGE(
      constellation,
      6,
      cmpGE(team.common.moonsign, 2, percent(dm.constellation6.critDMG_))
    )
  ),
  cmpGE(target.common.moonsign, 1, 1)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Desperate Gamble (burst); C5 The Greatest Treasure (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  teamBuff.premod.eleMas.add(a4Heal_eleMas),
  teamBuff.premod.critRate_.add(c6FlaskFull_critRate_),
  teamBuff.premod.critDMG_.add(c6FlaskFull_critDMG_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_aimedCharged', info, 'atk', dm.charged.fullyAimed, 'charged', {
    ele: info.ele,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_bombDmg', info, 'atk', dm.skill.bombDmg, 'skill'),
  dmg('skill_unfilledDmg', info, 'atk', dm.skill.unfilledDmg, 'skill'),
  dmg('skill_filledDmg', info, 'atk', dm.skill.filledDmg, 'skill'),
  (
    [
      ['skill_meowDmgPyro', 'pyro'],
      ['skill_meowDmgHydro', 'hydro'],
      ['skill_meowDmgElectro', 'electro'],
      ['skill_meowDmgCryo', 'cryo'],
    ] as const
  ).flatMap(([name, ele]) =>
    dmg(name, info, 'atk', dm.skill.meowDmg, 'skill', {
      ele,
      baseMulti: gleam,
    })
  ),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  (
    [
      ['burst_robotDmgPyro', 'pyro'],
      ['burst_robotDmgHydro', 'hydro'],
      ['burst_robotDmgElectro', 'electro'],
      ['burst_robotDmgCryo', 'cryo'],
    ] as const
  ).flatMap(([name, ele]) =>
    dmg(name, info, 'atk', dm.burst.robotDmg, 'burst', {
      ele,
      baseMulti: prod(gleam, a1_pyro_robot_dmg_mult_),
    })
  ),
  customHeal(
    'burst_robotHeal',
    prod(
      sum(
        prod(
          percent(talentSubscript(burst, dm.burst.robotHealMult)),
          final.atk
        ),
        talentSubscript(burst, dm.burst.robotHealFlat)
      ),
      a1_hydro_robot_heal_mult_
    )
  ),
  customHeal(
    'burst_lowestHeal',
    prod(
      sum(
        prod(
          percent(talentSubscript(burst, dm.burst.lowestHealMult)),
          final.atk
        ),
        talentSubscript(burst, dm.burst.lowestHealFlat)
      ),
      a1_hydro_robot_heal_mult_
    )
  ),

  customParam('a1_pyro_robot_dmg_mult_', a1_pyro_robot_dmg_mult_, {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customParam('a1_hydro_robot_heal_mult_', a1_hydro_robot_heal_mult_, {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)

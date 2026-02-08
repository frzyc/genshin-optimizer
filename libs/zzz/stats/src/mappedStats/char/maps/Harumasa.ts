import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Harumasa'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackCloudPiercer:
      data_gen.skillParams['basic']['BasicAttackCloudPiercer'],
    BasicAttackCloudPiercerDrift:
      data_gen.skillParams['basic']['BasicAttackCloudPiercerDrift'],
    BasicAttackFallingFeather:
      data_gen.skillParams['basic']['BasicAttackFallingFeather'],
    BasicAttackHaOtoNoYa: data_gen.skillParams['basic']['BasicAttackHaOtoNoYa'],
  },
  dodge: {
    DodgeQuickFlash: data_gen.skillParams['dodge']['DodgeQuickFlash'],
    DashAttackHitenNoTsuru:
      data_gen.skillParams['dodge']['DashAttackHitenNoTsuru'],
    DodgeCounterHiddenEdge:
      data_gen.skillParams['dodge']['DodgeCounterHiddenEdge'],
    DashAttackHitenNoTsuruSlash:
      data_gen.skillParams['dodge']['DashAttackHitenNoTsuruSlash'],
    ChasingThunder: data_gen.skillParams['dodge']['ChasingThunder'],
  },
  special: {
    SpecialAttackNowhereToHide:
      data_gen.skillParams['special']['SpecialAttackNowhereToHide'],
    EXSpecialAttackNowhereToRun:
      data_gen.skillParams['special']['EXSpecialAttackNowhereToRun'],
    EXSpecialAttackNowhereToRunPatrol:
      data_gen.skillParams['special']['EXSpecialAttackNowhereToRunPatrol'],
  },
  chain: {
    ChainAttackKaiHanare: data_gen.skillParams['chain']['ChainAttackKaiHanare'],
    UltimateZanshin: data_gen.skillParams['chain']['UltimateZanshin'],
    ZanshinScatteredBlossoms:
      data_gen.skillParams['chain']['ZanshinScatteredBlossoms'],
  },
  assist: {
    QuickAssistBracedBow:
      data_gen.skillParams['assist']['QuickAssistBracedBow'],
    DefensiveAssistYugamae:
      data_gen.skillParams['assist']['DefensiveAssistYugamae'],
    AssistFollowUpYugamaeSlash:
      data_gen.skillParams['assist']['AssistFollowUpYugamaeSlash'],
  },
  core: {
    crit_: data_gen.coreParams[0],
    stacks_gained_dash: data_gen.coreParams[1][0],
    stacks_gained_ult: data_gen.coreParams[2][0],
    stacks_per_skill: data_gen.coreParams[3][0],
    max_stacks: data_gen.coreParams[4][0],
    duration: data_gen.coreParams[5][0],
    crit_dmg_: data_gen.coreParams[6],
  },
  ability: {
    common_dmg_: data_gen.abilityParams[0],
    stacks: data_gen.abilityParams[1],
  },
  m1: {
    max_stacks: data_gen.mindscapeParams[0][0],
    shots_fired: data_gen.mindscapeParams[0][1],
  },
  m2: {
    stacks_gained: data_gen.mindscapeParams[1][0],
    max_stacks: data_gen.mindscapeParams[1][1],
    dmg_: data_gen.mindscapeParams[1][2],
    stacks_consumed: data_gen.mindscapeParams[1][3],
  },
  m4: {
    duration: data_gen.mindscapeParams[3][0],
    decibels: data_gen.mindscapeParams[3][1],
  },
  m6: {
    electric_resIgn_: data_gen.mindscapeParams[5][0],
    duration: data_gen.mindscapeParams[5][1],
    hits: data_gen.mindscapeParams[5][2],
    dmg: data_gen.mindscapeParams[5][3],
  },
} as const

export default dm

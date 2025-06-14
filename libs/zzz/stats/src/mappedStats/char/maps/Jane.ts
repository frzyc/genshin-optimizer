import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Jane'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackDancingBlades:
      data_gen.skillParams['basic']['BasicAttackDancingBlades'],
    Passion: data_gen.skillParams['basic']['Passion'],
    BasicAttackSalchowJump:
      data_gen.skillParams['basic']['BasicAttackSalchowJump'],
  },
  dodge: {
    DodgePhantom: data_gen.skillParams['dodge']['DodgePhantom'],
    DashAttackEdgeJump: data_gen.skillParams['dodge']['DashAttackEdgeJump'],
    DashAttackPhantomThrust:
      data_gen.skillParams['dodge']['DashAttackPhantomThrust'],
    DodgeCounterSwiftShadow:
      data_gen.skillParams['dodge']['DodgeCounterSwiftShadow'],
    DodgeCounterSwiftShadowDance:
      data_gen.skillParams['dodge']['DodgeCounterSwiftShadowDance'],
  },
  special: {
    SpecialAttackAerialSweep:
      data_gen.skillParams['special']['SpecialAttackAerialSweep'],
    EXSpecialAttackAerialSweepClearout:
      data_gen.skillParams['special']['EXSpecialAttackAerialSweepClearout'],
  },
  chain: {
    ChainAttackFlowersOfSin:
      data_gen.skillParams['chain']['ChainAttackFlowersOfSin'],
    UltimateFinalCurtain: data_gen.skillParams['chain']['UltimateFinalCurtain'],
  },
  assist: {
    QuickAssistDarkThorn:
      data_gen.skillParams['assist']['QuickAssistDarkThorn'],
    QuickAssistLutzJump: data_gen.skillParams['assist']['QuickAssistLutzJump'],
    DefensiveAssistLastDefense:
      data_gen.skillParams['assist']['DefensiveAssistLastDefense'],
    AssistFollowUpGaleSweep:
      data_gen.skillParams['assist']['AssistFollowUpGaleSweep'],
  },
  core: {
    gnawed_duration: data_gen.coreParams[0][0],
    flinch_extend_duration: data_gen.coreParams[1][0],
    assault_crit_: data_gen.coreParams[2],
    assault_crit_dmg_: data_gen.coreParams[3],
    assault_crit_step: data_gen.coreParams[4],
  },
  ability: {
    physical_anomBuildup_: data_gen.abilityParams[0],
    additional_physical_anomBuildup_: data_gen.abilityParams[1],
  },
  m1: {
    physical_anomBuildup_: data_gen.mindscapeParams[0][0],
    anomProf_step: data_gen.mindscapeParams[0][1],
    max_dmg_: data_gen.mindscapeParams[0][2],
  },
  m2: {
    defIgn_: data_gen.mindscapeParams[1][0],
    assault_crit_dmg_: data_gen.mindscapeParams[1][1],
  },
  m4: {
    anomaly_dmg_: data_gen.mindscapeParams[3][0],
    duration: data_gen.mindscapeParams[3][1],
  },
  m6: {
    crit_: data_gen.mindscapeParams[5][0],
    crit_dmg_: data_gen.mindscapeParams[5][1],
    dmg: data_gen.mindscapeParams[5][2],
  },
} as const

export default dm

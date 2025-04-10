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
} as const

export default dm

import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Remielle'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackLeap: data_gen.skillParams['basic']['BasicAttackLeap'],
    BasicAttackSoloDance: data_gen.skillParams['basic']['BasicAttackSoloDance'],
    BasicAttackRainbowsEnd:
      data_gen.skillParams['basic']['BasicAttackRainbowsEnd'],
    BasicAttackFleetingGrace:
      data_gen.skillParams['basic']['BasicAttackFleetingGrace'],
  },
  dodge: {
    DodgeRetreatingLight: data_gen.skillParams['dodge']['DodgeRetreatingLight'],
    DashAttackKeenLight: data_gen.skillParams['dodge']['DashAttackKeenLight'],
    DodgeCounterMirroredShadow:
      data_gen.skillParams['dodge']['DodgeCounterMirroredShadow'],
  },
  special: {
    SpecialAttackSliverOfLight:
      data_gen.skillParams['special']['SpecialAttackSliverOfLight'],
    EXSpecialAttackOdeToDawn:
      data_gen.skillParams['special']['EXSpecialAttackOdeToDawn'],
    SpecialAttackOdeToDawnRadiantTurn:
      data_gen.skillParams['special']['SpecialAttackOdeToDawnRadiantTurn'],
  },
  chain: {
    ChainAttackInterwovenDanceSteps:
      data_gen.skillParams['chain']['ChainAttackInterwovenDanceSteps'],
    UltimateDazzlingCurtainCall:
      data_gen.skillParams['chain']['UltimateDazzlingCurtainCall'],
  },
  assist: {
    QuickAssistFeatherglowRebirth:
      data_gen.skillParams['assist']['QuickAssistFeatherglowRebirth'],
    DefensiveAssistFleetingLight:
      data_gen.skillParams['assist']['DefensiveAssistFleetingLight'],
    AssistFollowUpAwakeningGlimmer:
      data_gen.skillParams['assist']['AssistFollowUpAwakeningGlimmer'],
    AssistFlowerFeatherDance:
      data_gen.skillParams['assist']['AssistFlowerFeatherDance'],
  },
} as const

export default dm

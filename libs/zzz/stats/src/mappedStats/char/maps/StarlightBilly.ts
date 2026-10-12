import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'StarlightBilly'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackKnightsTechnique:
      data_gen.skillParams['basic']['BasicAttackKnightsTechnique'],
    BasicAttackFullThrottleStarlight:
      data_gen.skillParams['basic']['BasicAttackFullThrottleStarlight'],
  },
  dodge: {
    DodgeCloseCall: data_gen.skillParams['dodge']['DodgeCloseCall'],
    DodgeThroughTheGalaxy:
      data_gen.skillParams['dodge']['DodgeThroughTheGalaxy'],
    DashAttackStarlightRetribution:
      data_gen.skillParams['dodge']['DashAttackStarlightRetribution'],
    DodgeCounterDuelKing: data_gen.skillParams['dodge']['DodgeCounterDuelKing'],
    DodgeCounterAfterfireSpin:
      data_gen.skillParams['dodge']['DodgeCounterAfterfireSpin'],
  },
  special: {
    SpecialAttackDriveSuppression:
      data_gen.skillParams['special']['SpecialAttackDriveSuppression'],
    SpecialAttackRunWild:
      data_gen.skillParams['special']['SpecialAttackRunWild'],
    EXSpecialAttackCoolWheelie:
      data_gen.skillParams['special']['EXSpecialAttackCoolWheelie'],
    EXSpecialAttackHighTractionWheels:
      data_gen.skillParams['special']['EXSpecialAttackHighTractionWheels'],
    EXSpecialAttackRockingFootwork:
      data_gen.skillParams['special']['EXSpecialAttackRockingFootwork'],
  },
  chain: {
    ChainAttackKnightsSwagger:
      data_gen.skillParams['chain']['ChainAttackKnightsSwagger'],
    UltimateStarlightKnightFlyingKick:
      data_gen.skillParams['chain']['UltimateStarlightKnightFlyingKick'],
  },
  assist: {
    QuickAssistStarlightPowerOfBonds:
      data_gen.skillParams['assist']['QuickAssistStarlightPowerOfBonds'],
    DefensiveAssistHerosEntrance:
      data_gen.skillParams['assist']['DefensiveAssistHerosEntrance'],
    AssistFollowUpVillainsExit:
      data_gen.skillParams['assist']['AssistFollowUpVillainsExit'],
  },
} as const

export default dm

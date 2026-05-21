import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Promeia'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackSweepingEdge:
      data_gen.skillParams['basic']['BasicAttackSweepingEdge'],
    BasicAttackWhirlingBlade:
      data_gen.skillParams['basic']['BasicAttackWhirlingBlade'],
    BoundAbsolution: data_gen.skillParams['basic']['BoundAbsolution'],
  },
  dodge: {
    DodgeVeiledStep: data_gen.skillParams['dodge']['DodgeVeiledStep'],
    DashAttackGrimReap: data_gen.skillParams['dodge']['DashAttackGrimReap'],
    DodgeCounterSoaringBat:
      data_gen.skillParams['dodge']['DodgeCounterSoaringBat'],
  },
  special: {
    SpecialAttackExecutionColdFlash:
      data_gen.skillParams['special']['SpecialAttackExecutionColdFlash'],
    EXSpecialAttackExecutionGlacialDeath:
      data_gen.skillParams['special']['EXSpecialAttackExecutionGlacialDeath'],
    EXSpecialAttackExecutionShroudedInShadow:
      data_gen.skillParams['special'][
        'EXSpecialAttackExecutionShroudedInShadow'
      ],
    SpecialAttackExecutionDescendingFrost:
      data_gen.skillParams['special']['SpecialAttackExecutionDescendingFrost'],
    SpecialAttackExecutionLayeredFrost:
      data_gen.skillParams['special']['SpecialAttackExecutionLayeredFrost'],
    EXSpecialAttackExecutionMercilessJudgment:
      data_gen.skillParams['special'][
        'EXSpecialAttackExecutionMercilessJudgment'
      ],
  },
  chain: {
    ChainAttackHangingJudgment:
      data_gen.skillParams['chain']['ChainAttackHangingJudgment'],
    UltimateGlaciatingImpalement:
      data_gen.skillParams['chain']['UltimateGlaciatingImpalement'],
  },
  assist: {
    QuickAssistAmbushingStrike:
      data_gen.skillParams['assist']['QuickAssistAmbushingStrike'],
    DefensiveAssistInjunction:
      data_gen.skillParams['assist']['DefensiveAssistInjunction'],
    AssistFollowUpInterceptingStrike:
      data_gen.skillParams['assist']['AssistFollowUpInterceptingStrike'],
  },
} as const

export default dm

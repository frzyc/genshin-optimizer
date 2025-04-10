import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Lucy'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackLadysBat: data_gen.skillParams['basic']['BasicAttackLadysBat'],
    GuardBoarsToArms: data_gen.skillParams['basic']['GuardBoarsToArms'],
    GuardBoarsSpinningSwing:
      data_gen.skillParams['basic']['GuardBoarsSpinningSwing'],
  },
  dodge: {
    DodgeFoulBall: data_gen.skillParams['dodge']['DodgeFoulBall'],
    DashAttackFearlessBoar:
      data_gen.skillParams['dodge']['DashAttackFearlessBoar'],
    DodgeCounterReturningTusk:
      data_gen.skillParams['dodge']['DodgeCounterReturningTusk'],
  },
  special: {
    SpecialAttackSolidHit:
      data_gen.skillParams['special']['SpecialAttackSolidHit'],
    EXSpecialAttackHomeRun:
      data_gen.skillParams['special']['EXSpecialAttackHomeRun'],
    CheerOn: data_gen.skillParams['special']['CheerOn'],
  },
  chain: {
    ChainAttackGrandSlam: data_gen.skillParams['chain']['ChainAttackGrandSlam'],
    UltimateWalkOffHomeRun:
      data_gen.skillParams['chain']['UltimateWalkOffHomeRun'],
  },
  assist: {
    QuickAssistHitByPitch:
      data_gen.skillParams['assist']['QuickAssistHitByPitch'],
    DefensiveAssistSafeOnBase:
      data_gen.skillParams['assist']['DefensiveAssistSafeOnBase'],
    AssistFollowUpScoredARun:
      data_gen.skillParams['assist']['AssistFollowUpScoredARun'],
  },
} as const

export default dm

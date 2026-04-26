import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'NangongYu'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackShootingStarStep:
      data_gen.skillParams['basic']['BasicAttackShootingStarStep'],
    BasicAttackAdorableExplosiveImpact:
      data_gen.skillParams['basic']['BasicAttackAdorableExplosiveImpact'],
  },
  dodge: {
    DodgeNaturalDancer: data_gen.skillParams['dodge']['DodgeNaturalDancer'],
    DashAttackSpinningMeteor:
      data_gen.skillParams['dodge']['DashAttackSpinningMeteor'],
    DodgeCounterAsteroidWaltz:
      data_gen.skillParams['dodge']['DodgeCounterAsteroidWaltz'],
  },
  special: {
    SpecialAttackTheWeightOfLove:
      data_gen.skillParams['special']['SpecialAttackTheWeightOfLove'],
    EXSpecialAttackTheUnbearableWeightOfLove:
      data_gen.skillParams['special'][
        'EXSpecialAttackTheUnbearableWeightOfLove'
      ],
  },
  chain: {
    ChainAttackCometGravity:
      data_gen.skillParams['chain']['ChainAttackCometGravity'],
    UltimateMeteorShower: data_gen.skillParams['chain']['UltimateMeteorShower'],
  },
  assist: {
    QuickAssistEmergencySave:
      data_gen.skillParams['assist']['QuickAssistEmergencySave'],
    DefensiveAssistPerfectedChoreography:
      data_gen.skillParams['assist']['DefensiveAssistPerfectedChoreography'],
    AssistFollowUpImprovisedPerformance:
      data_gen.skillParams['assist']['AssistFollowUpImprovisedPerformance'],
  },
} as const

export default dm

import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Velina'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackDancingFans:
      data_gen.skillParams['basic']['BasicAttackDancingFans'],
  },
  dodge: {
    DodgeWindwardSweep: data_gen.skillParams['dodge']['DodgeWindwardSweep'],
    DashAttackGaleStep: data_gen.skillParams['dodge']['DashAttackGaleStep'],
    DodgeCounterCloudrend:
      data_gen.skillParams['dodge']['DodgeCounterCloudrend'],
  },
  special: {
    SpecialAttackWindShearPurgingSurge:
      data_gen.skillParams['special']['SpecialAttackWindShearPurgingSurge'],
    EXSpecialAttackWindShearPurifyingRise:
      data_gen.skillParams['special']['EXSpecialAttackWindShearPurifyingRise'],
    EXSpecialAttackWindShearTripleDeathblow:
      data_gen.skillParams['special'][
        'EXSpecialAttackWindShearTripleDeathblow'
      ],
    EXSpecialAttackWindShearEyeOfTheStorm:
      data_gen.skillParams['special']['EXSpecialAttackWindShearEyeOfTheStorm'],
    SweepingCyclone: data_gen.skillParams['special']['SweepingCyclone'],
    CondensedCyclone: data_gen.skillParams['special']['CondensedCyclone'],
  },
  chain: {
    ChainAttackThousandfoldSpiral:
      data_gen.skillParams['chain']['ChainAttackThousandfoldSpiral'],
    UltimateHeedTheTempest:
      data_gen.skillParams['chain']['UltimateHeedTheTempest'],
  },
  assist: {
    QuickAssistEmergencyProtocol:
      data_gen.skillParams['assist']['QuickAssistEmergencyProtocol'],
    DefensiveAssistJudiciousIntervention:
      data_gen.skillParams['assist']['DefensiveAssistJudiciousIntervention'],
    AssistFollowUpNegotiationTechniques:
      data_gen.skillParams['assist']['AssistFollowUpNegotiationTechniques'],
  },
} as const

export default dm

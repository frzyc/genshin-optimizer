import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Grace'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackHighPressureSpike:
      data_gen.skillParams['basic']['BasicAttackHighPressureSpike'],
  },
  dodge: {
    DodgeSafetyRegulation:
      data_gen.skillParams['dodge']['DodgeSafetyRegulation'],
    DashAttackQuickInspection:
      data_gen.skillParams['dodge']['DashAttackQuickInspection'],
    DodgeCounterViolationPenalty:
      data_gen.skillParams['dodge']['DodgeCounterViolationPenalty'],
  },
  special: {
    SpecialAttackObstructionRemoval:
      data_gen.skillParams['special']['SpecialAttackObstructionRemoval'],
    EXSpecialAttackSuperchargedObstructionRemoval:
      data_gen.skillParams['special'][
        'EXSpecialAttackSuperchargedObstructionRemoval'
      ],
  },
  chain: {
    ChainAttackCollaborativeConstruction:
      data_gen.skillParams['chain']['ChainAttackCollaborativeConstruction'],
    UltimateDemolitionBlastBeware:
      data_gen.skillParams['chain']['UltimateDemolitionBlastBeware'],
  },
  assist: {
    QuickAssistIncidentManagement:
      data_gen.skillParams['assist']['QuickAssistIncidentManagement'],
    EvasiveAssistRapidRiskResponse:
      data_gen.skillParams['assist']['EvasiveAssistRapidRiskResponse'],
    AssistFollowUpCounterVoltNeedle:
      data_gen.skillParams['assist']['AssistFollowUpCounterVoltNeedle'],
  },
} as const

export default dm

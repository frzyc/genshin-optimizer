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
  core: {
    stacks_gained: data_gen.coreParams[0][0],
    max_stacks: data_gen.coreParams[1][0],
    electric_anomBuildup_: data_gen.coreParams[2],
  },
  ability: {
    shock_dmg_: data_gen.abilityParams[0],
    stacks: data_gen.abilityParams[1],
  },
  m1: {
    energy: data_gen.mindscapeParams[0][0],
    max_energy: data_gen.mindscapeParams[0][1],
  },
  m2: {
    electric_resRed_: data_gen.mindscapeParams[1][0],
    electric_anomBuildupResRed_: data_gen.mindscapeParams[1][1],
    duration: data_gen.mindscapeParams[1][2],
  },
  m4: {
    stacks_gained: data_gen.mindscapeParams[3][0],
    max_stacks: data_gen.mindscapeParams[3][1],
    stacks_consumed: data_gen.mindscapeParams[3][2],
    enerRegen_: data_gen.mindscapeParams[3][3],
  },
  m6: {
    mv_mult_: data_gen.mindscapeParams[5][0],
  },
} as const

export default dm

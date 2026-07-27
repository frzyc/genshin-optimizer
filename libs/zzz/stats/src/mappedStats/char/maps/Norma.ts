import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Norma'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackEngineeringInsurance:
      data_gen.skillParams['basic']['BasicAttackEngineeringInsurance'],
    BasicAttackHatTrick: data_gen.skillParams['basic']['BasicAttackHatTrick'],
  },
  dodge: {
    DodgeDevelopmentProtocols:
      data_gen.skillParams['dodge']['DodgeDevelopmentProtocols'],
    DashAttackDeadlineRush:
      data_gen.skillParams['dodge']['DashAttackDeadlineRush'],
    DodgeCounterComplianceTesting:
      data_gen.skillParams['dodge']['DodgeCounterComplianceTesting'],
  },
  special: {
    SpecialAttackThermalShutdown:
      data_gen.skillParams['special']['SpecialAttackThermalShutdown'],
    EXSpecialAttackEnNahBarrage:
      data_gen.skillParams['special']['EXSpecialAttackEnNahBarrage'],
    SpecialAttackTargetPractice:
      data_gen.skillParams['special']['SpecialAttackTargetPractice'],
    EXSpecialAttackExplosiveExperiment:
      data_gen.skillParams['special']['EXSpecialAttackExplosiveExperiment'],
  },
  chain: {
    ChainAttackImpactDrill:
      data_gen.skillParams['chain']['ChainAttackImpactDrill'],
    UltimateDoctrineOfSuperiorFirepower:
      data_gen.skillParams['chain']['UltimateDoctrineOfSuperiorFirepower'],
  },
  assist: {
    QuickAssistRoaringBackup:
      data_gen.skillParams['assist']['QuickAssistRoaringBackup'],
    DefensiveAssistTechnologicalBastion:
      data_gen.skillParams['assist']['DefensiveAssistTechnologicalBastion'],
    AssistFollowUpTechnologicalSuppression:
      data_gen.skillParams['assist']['AssistFollowUpTechnologicalSuppression'],
  },
} as const

export default dm

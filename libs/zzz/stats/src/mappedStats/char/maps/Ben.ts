import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Ben'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackDebtReconciliation:
      data_gen.skillParams['basic']['BasicAttackDebtReconciliation'],
  },
  dodge: {
    DodgeMissingInvoice: data_gen.skillParams['dodge']['DodgeMissingInvoice'],
    DashAttackIncomingExpense:
      data_gen.skillParams['dodge']['DashAttackIncomingExpense'],
    DodgeCounterAccountsSettled:
      data_gen.skillParams['dodge']['DodgeCounterAccountsSettled'],
  },
  special: {
    SpecialAttackFiscalFist:
      data_gen.skillParams['special']['SpecialAttackFiscalFist'],
    EXSpecialAttackCashflowCounter:
      data_gen.skillParams['special']['EXSpecialAttackCashflowCounter'],
  },
  chain: {
    ChainAttackSignedAndSealed:
      data_gen.skillParams['chain']['ChainAttackSignedAndSealed'],
    UltimateCompletePayback:
      data_gen.skillParams['chain']['UltimateCompletePayback'],
  },
  assist: {
    QuickAssistJointAccount:
      data_gen.skillParams['assist']['QuickAssistJointAccount'],
    DefensiveAssistRiskAllocation:
      data_gen.skillParams['assist']['DefensiveAssistRiskAllocation'],
    AssistFollowUpDontBreakContract:
      data_gen.skillParams['assist']['AssistFollowUpDontBreakContract'],
  },
} as const

export default dm

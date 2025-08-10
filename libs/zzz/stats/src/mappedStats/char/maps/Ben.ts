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
  core: {
    atk: data_gen.coreParams[0],
    shield_: data_gen.coreParams[1],
    shield: data_gen.coreParams[2],
    duration: data_gen.coreParams[3][0],
  },
  ability: {
    crit_: data_gen.abilityParams[0],
  },
  m1: {
    dmg_red_: data_gen.mindscapeParams[0][0],
    duration: data_gen.mindscapeParams[0][1],
  },
  m2: {
    dmg: data_gen.mindscapeParams[1][0],
  },
  m4: {
    dmg_: data_gen.mindscapeParams[3][0],
  },
  m6: {
    dazeInc_: data_gen.mindscapeParams[5][0],
    duration: data_gen.mindscapeParams[5][1],
  },
} as const

export default dm

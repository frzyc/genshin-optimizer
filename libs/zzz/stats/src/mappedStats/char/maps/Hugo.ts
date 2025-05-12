import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Hugo'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackDarkAbyssQuartet:
      data_gen.skillParams['basic']['BasicAttackDarkAbyssQuartet'],
    BasicAttackDarkAbyssConcerto:
      data_gen.skillParams['basic']['BasicAttackDarkAbyssConcerto'],
  },
  dodge: {
    DodgePhantasm: data_gen.skillParams['dodge']['DodgePhantasm'],
    DashAttackPhantasmShatter:
      data_gen.skillParams['dodge']['DashAttackPhantasmShatter'],
    DodgeCounterPhantasmSlash:
      data_gen.skillParams['dodge']['DodgeCounterPhantasmSlash'],
  },
  special: {
    SpecialAttackSoulHunterJudgment:
      data_gen.skillParams['special']['SpecialAttackSoulHunterJudgment'],
    EXSpecialAttackSoulHunterPunishment:
      data_gen.skillParams['special']['EXSpecialAttackSoulHunterPunishment'],
  },
  chain: {
    ChainAttackTrickOfFate:
      data_gen.skillParams['chain']['ChainAttackTrickOfFate'],
    UltimateBlaspheme: data_gen.skillParams['chain']['UltimateBlaspheme'],
  },
  assist: {
    QuickAssistElegy: data_gen.skillParams['assist']['QuickAssistElegy'],
    DefensiveAssistTheEndHasNotCome:
      data_gen.skillParams['assist']['DefensiveAssistTheEndHasNotCome'],
    AssistFollowUpAceReversal:
      data_gen.skillParams['assist']['AssistFollowUpAceReversal'],
  },
} as const

export default dm

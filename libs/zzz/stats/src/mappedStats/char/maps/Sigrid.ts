import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Sigrid'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackFrostTippedSpear:
      data_gen.skillParams['basic']['BasicAttackFrostTippedSpear'],
    BasicAttackConvergingSpear:
      data_gen.skillParams['basic']['BasicAttackConvergingSpear'],
    BasicAttackConvergingSpear1stStage:
      data_gen.skillParams['basic']['BasicAttackConvergingSpear1stStage'],
    BasicAttackConvergingSpear2ndStage:
      data_gen.skillParams['basic']['BasicAttackConvergingSpear2ndStage'],
    BasicAttackConvergingSpear3rdStage:
      data_gen.skillParams['basic']['BasicAttackConvergingSpear3rdStage'],
  },
  dodge: {
    DodgeCloudstep: data_gen.skillParams['dodge']['DodgeCloudstep'],
    DashAttackWindchase: data_gen.skillParams['dodge']['DashAttackWindchase'],
    DodgeCounterCounterthrust:
      data_gen.skillParams['dodge']['DodgeCounterCounterthrust'],
  },
  special: {
    SpecialAttackFrostflower:
      data_gen.skillParams['special']['SpecialAttackFrostflower'],
    EXSpecialAttackScatteredJade:
      data_gen.skillParams['special']['EXSpecialAttackScatteredJade'],
    EXSpecialAttackShatteredJade:
      data_gen.skillParams['special']['EXSpecialAttackShatteredJade'],
  },
  chain: {
    ChainAttackEncroachingIce:
      data_gen.skillParams['chain']['ChainAttackEncroachingIce'],
    UltimateFrozenHeavens:
      data_gen.skillParams['chain']['UltimateFrozenHeavens'],
  },
  assist: {
    QuickAssistIronSentinel:
      data_gen.skillParams['assist']['QuickAssistIronSentinel'],
    DefensiveAssistDauntlessCold:
      data_gen.skillParams['assist']['DefensiveAssistDauntlessCold'],
    AssistFollowUpDevouringFrost:
      data_gen.skillParams['assist']['AssistFollowUpDevouringFrost'],
  },
} as const

export default dm

import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Soldier11'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackWarmupSparks:
      data_gen.skillParams['basic']['BasicAttackWarmupSparks'],
    BasicAttackFireSuppression:
      data_gen.skillParams['basic']['BasicAttackFireSuppression'],
  },
  dodge: {
    DodgeTemperedFire: data_gen.skillParams['dodge']['DodgeTemperedFire'],
    DashAttackBlazingFire:
      data_gen.skillParams['dodge']['DashAttackBlazingFire'],
    DashAttackFireSuppression:
      data_gen.skillParams['dodge']['DashAttackFireSuppression'],
    DodgeCounterBackdraft:
      data_gen.skillParams['dodge']['DodgeCounterBackdraft'],
  },
  special: {
    SpecialAttackRagingFire:
      data_gen.skillParams['special']['SpecialAttackRagingFire'],
    EXSpecialAttackFerventFire:
      data_gen.skillParams['special']['EXSpecialAttackFerventFire'],
  },
  chain: {
    ChainAttackUpliftingFlame:
      data_gen.skillParams['chain']['ChainAttackUpliftingFlame'],
    UltimateBellowingFlame:
      data_gen.skillParams['chain']['UltimateBellowingFlame'],
  },
  assist: {
    QuickAssistCoveringFire:
      data_gen.skillParams['assist']['QuickAssistCoveringFire'],
    DefensiveAssistHoldTheLine:
      data_gen.skillParams['assist']['DefensiveAssistHoldTheLine'],
    AssistFollowUpReignition:
      data_gen.skillParams['assist']['AssistFollowUpReignition'],
  },
} as const

export default dm

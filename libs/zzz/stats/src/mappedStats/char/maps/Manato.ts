import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Manato'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackBlazingWindSlash:
      data_gen.skillParams['basic']['BasicAttackBlazingWindSlash'],
    BasicAttackBlazingWindMistySlash:
      data_gen.skillParams['basic']['BasicAttackBlazingWindMistySlash'],
  },
  dodge: {
    DodgeRadiantBlade: data_gen.skillParams['dodge']['DodgeRadiantBlade'],
    DashAttackRadiantBladeZanshin:
      data_gen.skillParams['dodge']['DashAttackRadiantBladeZanshin'],
    DodgeCounterRadiantBladeBattleSweep:
      data_gen.skillParams['dodge']['DodgeCounterRadiantBladeBattleSweep'],
  },
  special: {
    SpecialAttackReturnToAshes:
      data_gen.skillParams['special']['SpecialAttackReturnToAshes'],
    SpecialAttackReturnToAshesSacrifice:
      data_gen.skillParams['special']['SpecialAttackReturnToAshesSacrifice'],
    EXSpecialAttackReturnToAshesFall:
      data_gen.skillParams['special']['EXSpecialAttackReturnToAshesFall'],
  },
  chain: {
    ChainAttackBlazingEruption:
      data_gen.skillParams['chain']['ChainAttackBlazingEruption'],
    UltimateMusouAratama: data_gen.skillParams['chain']['UltimateMusouAratama'],
  },
  assist: {
    QuickAssistLoneShadowRegroup:
      data_gen.skillParams['assist']['QuickAssistLoneShadowRegroup'],
    DefensiveAssistLoneShadowMountainStand:
      data_gen.skillParams['assist']['DefensiveAssistLoneShadowMountainStand'],
    AssistFollowUpLoneShadowBreakingFang:
      data_gen.skillParams['assist']['AssistFollowUpLoneShadowBreakingFang'],
  },
} as const

export default dm

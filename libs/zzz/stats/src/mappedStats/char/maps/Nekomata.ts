import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Nekomata'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackKittySlash:
      data_gen.skillParams['basic']['BasicAttackKittySlash'],
    BasicAttackCrimsonBlade:
      data_gen.skillParams['basic']['BasicAttackCrimsonBlade'],
  },
  dodge: {
    DodgeCantTouchMeow: data_gen.skillParams['dodge']['DodgeCantTouchMeow'],
    DashAttackOverHere: data_gen.skillParams['dodge']['DashAttackOverHere'],
    DodgeCounterPhantomClaws:
      data_gen.skillParams['dodge']['DodgeCounterPhantomClaws'],
  },
  special: {
    SpecialAttackSurpriseAttack:
      data_gen.skillParams['special']['SpecialAttackSurpriseAttack'],
    EXSpecialAttackSuperSurpriseAttack:
      data_gen.skillParams['special']['EXSpecialAttackSuperSurpriseAttack'],
  },
  chain: {
    ChainAttackClawSwipe: data_gen.skillParams['chain']['ChainAttackClawSwipe'],
    UltimateClawSmash: data_gen.skillParams['chain']['UltimateClawSmash'],
  },
  assist: {
    QuickAssistCatsPaw: data_gen.skillParams['assist']['QuickAssistCatsPaw'],
    DefensiveAssistDesperateDefense:
      data_gen.skillParams['assist']['DefensiveAssistDesperateDefense'],
    AssistFollowUpShadowStrike:
      data_gen.skillParams['assist']['AssistFollowUpShadowStrike'],
  },
} as const

export default dm

import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Soukaku'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackMakingRiceCakes:
      data_gen.skillParams['basic']['BasicAttackMakingRiceCakes'],
    BasicAttackMakingRiceCakesFrostedBanner:
      data_gen.skillParams['basic']['BasicAttackMakingRiceCakesFrostedBanner'],
  },
  dodge: {
    DodgeGrabABite: data_gen.skillParams['dodge']['DodgeGrabABite'],
    DashAttack5050: data_gen.skillParams['dodge']['DashAttack5050'],
    DashAttack5050FrostedBanner:
      data_gen.skillParams['dodge']['DashAttack5050FrostedBanner'],
    DodgeCounterAwayFromMySnacks:
      data_gen.skillParams['dodge']['DodgeCounterAwayFromMySnacks'],
  },
  special: {
    SpecialAttackCoolingBento:
      data_gen.skillParams['special']['SpecialAttackCoolingBento'],
    EXSpecialAttackFanningMosquitoes:
      data_gen.skillParams['special']['EXSpecialAttackFanningMosquitoes'],
    SpecialAttackRally: data_gen.skillParams['special']['SpecialAttackRally'],
  },
  chain: {
    ChainAttackPuddingSlash:
      data_gen.skillParams['chain']['ChainAttackPuddingSlash'],
    UltimateJumboPuddingSlash:
      data_gen.skillParams['chain']['UltimateJumboPuddingSlash'],
  },
  assist: {
    QuickAssistASetForTwo:
      data_gen.skillParams['assist']['QuickAssistASetForTwo'],
    DefensiveAssistGuardingTactics:
      data_gen.skillParams['assist']['DefensiveAssistGuardingTactics'],
    AssistFollowUpSweepingStrike:
      data_gen.skillParams['assist']['AssistFollowUpSweepingStrike'],
  },
} as const

export default dm

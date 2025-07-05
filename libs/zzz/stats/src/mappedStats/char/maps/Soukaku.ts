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
  core: {
    atk_: data_gen.coreParams[0],
    max_atk: data_gen.coreParams[1][0],
    duration: data_gen.coreParams[2][0],
    max_atk_more: data_gen.coreParams[3][0],
  },
  ability: {
    ice_dmg_: data_gen.abilityParams[0],
    duration: data_gen.abilityParams[1],
  },
  m1: {
    extended_duration: data_gen.mindscapeParams[0][0],
  },
  m2: {
    chance: data_gen.mindscapeParams[1][0],
    vortex_gained: data_gen.mindscapeParams[1][1],
    energy: data_gen.mindscapeParams[1][2],
  },
  m4: {
    ice_resRed_: data_gen.mindscapeParams[3][0],
    duration: data_gen.mindscapeParams[3][1],
  },
  m6: {
    enhanced_attacks: data_gen.mindscapeParams[5][0],
    dmg_: data_gen.mindscapeParams[5][1],
  },
} as const

export default dm

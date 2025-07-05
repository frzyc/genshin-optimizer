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
  core: {
    common_dmg_: data_gen.coreParams[0],
    duration: data_gen.coreParams[1][0],
  },
  ability: {
    exSpecial_dmg_: data_gen.abilityParams[0],
    stacks: data_gen.abilityParams[1],
  },
  m1: {
    physical_resIgn_: data_gen.mindscapeParams[0][0],
  },
  m2: {
    enerRegen_: data_gen.mindscapeParams[1][0],
  },
  m4: {
    crit_: data_gen.mindscapeParams[3][0],
    duration: data_gen.mindscapeParams[3][1],
    stacks: data_gen.mindscapeParams[3][2],
  },
  m6: {
    crit_dmg_: data_gen.mindscapeParams[5][0],
    stacks: data_gen.mindscapeParams[5][1],
  },
} as const

export default dm

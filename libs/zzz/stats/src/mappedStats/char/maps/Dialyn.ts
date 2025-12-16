import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Dialyn'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackHappyToBeOfService:
      data_gen.skillParams['basic']['BasicAttackHappyToBeOfService'],
    BasicAttackRockPaperScissors:
      data_gen.skillParams['basic']['BasicAttackRockPaperScissors'],
  },
  dodge: {
    DodgeLineBusy: data_gen.skillParams['dodge']['DodgeLineBusy'],
    DashAttackSuddenCall: data_gen.skillParams['dodge']['DashAttackSuddenCall'],
    DodgeCounterNumberUnavailable:
      data_gen.skillParams['dodge']['DodgeCounterNumberUnavailable'],
  },
  special: {
    EXSpecialAttackGetLost:
      data_gen.skillParams['special']['EXSpecialAttackGetLost'],
    SpecialAttackWelcomeGesture:
      data_gen.skillParams['special']['SpecialAttackWelcomeGesture'],
    EXSpecialAttackRock: data_gen.skillParams['special']['EXSpecialAttackRock'],
    EXSpecialAttackScissors:
      data_gen.skillParams['special']['EXSpecialAttackScissors'],
    EXSpecialAttackPaper:
      data_gen.skillParams['special']['EXSpecialAttackPaper'],
  },
  chain: {
    ChainAttackWelcomeMat:
      data_gen.skillParams['chain']['ChainAttackWelcomeMat'],
    UltimateServiceStoppedForNumberDialed:
      data_gen.skillParams['chain']['UltimateServiceStoppedForNumberDialed'],
  },
  assist: {
    QuickAssistForwardCall:
      data_gen.skillParams['assist']['QuickAssistForwardCall'],
    DefensiveAssistDeclineCall:
      data_gen.skillParams['assist']['DefensiveAssistDeclineCall'],
    AssistFollowUpBacktoBackCalls:
      data_gen.skillParams['assist']['AssistFollowUpBacktoBackCalls'],
  },
  core: {
    positive_reviews_start: data_gen.coreParams[0][0],
    crit_threshold: data_gen.coreParams[1][0],
    impact: data_gen.coreParams[2],
    crit_step: data_gen.coreParams[3][0],
    max_impact: data_gen.coreParams[4][0],
    scissors_duration: data_gen.coreParams[5][0],
    paper_duration: data_gen.coreParams[6][0],
    stun_extension: data_gen.coreParams[7][0],
    stun_: data_gen.coreParams[8],
    passive_positive_reviews: data_gen.coreParams[9][0],
    exSpecial_positive_reviews: data_gen.coreParams[10][0],
    max_positive_reviews: data_gen.coreParams[11][0],
    min_positive_reviews1: data_gen.coreParams[12][0],
    positive_reviews_consumed1: data_gen.coreParams[13][0],
    min_positive_reviews2: data_gen.coreParams[14][0],
    positive_reviews_consumed2: data_gen.coreParams[15][0],
    positive_reviews_threshold: data_gen.coreParams[16][0],
    customer_complaint_gain: data_gen.coreParams[17][0],
    max_customer_complaint: data_gen.coreParams[18][0],
  },
  ability: {
    exSpecial_crit_dmg_: data_gen.abilityParams[0],
    common_dmg_: data_gen.abilityParams[1],
    duration: data_gen.abilityParams[2],
    overwhelmingly_positive_duration_threshold: data_gen.abilityParams[3],
    duration_extension: data_gen.abilityParams[4],
    attack_dmg: data_gen.abilityParams[5],
    rupture_dmg: data_gen.abilityParams[6],
  },
  m1: {
    positive_reviews_gain_increase: data_gen.mindscapeParams[0][0],
    resIgn_: data_gen.mindscapeParams[0][1],
  },
  m2: {
    stun_: data_gen.mindscapeParams[1][0],
    common_dmg_: data_gen.mindscapeParams[1][1],
  },
  m4: {
    energy: data_gen.mindscapeParams[3][0],
    cooldown: data_gen.mindscapeParams[3][1],
    atk: data_gen.mindscapeParams[3][2],
  },
  m6: {
    dmg: data_gen.mindscapeParams[5][0],
    max_instances: data_gen.mindscapeParams[5][1],
  },
} as const

export default dm

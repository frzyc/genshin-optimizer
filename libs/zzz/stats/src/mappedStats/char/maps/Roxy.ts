import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Roxy'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackDoStayAWhile:
      data_gen.skillParams['basic']['BasicAttackDoStayAWhile'],
  },
  dodge: {
    DodgeExcuseMe: data_gen.skillParams['dodge']['DodgeExcuseMe'],
    DashAttackForgiveMyRudeness:
      data_gen.skillParams['dodge']['DashAttackForgiveMyRudeness'],
    DodgeCounterReturnedCourtesy:
      data_gen.skillParams['dodge']['DodgeCounterReturnedCourtesy'],
  },
  special: {
    SpecialAttackMuchObliged:
      data_gen.skillParams['special']['SpecialAttackMuchObliged'],
    SpecialAttackForgiveMeForNotSeeingYouOff:
      data_gen.skillParams['special'][
        'SpecialAttackForgiveMeForNotSeeingYouOff'
      ],
    EXSpecialAttackDontCatchAChill:
      data_gen.skillParams['special']['EXSpecialAttackDontCatchAChill'],
    EXSpecialAttackKindlyRestInPeace:
      data_gen.skillParams['special']['EXSpecialAttackKindlyRestInPeace'],
    EyeOfTheStorm: data_gen.skillParams['special']['EyeOfTheStorm'],
  },
  chain: {
    ChainAttackGaleBurialGreatHammer:
      data_gen.skillParams['chain']['ChainAttackGaleBurialGreatHammer'],
    UltimateRequiemForTheNightBurial:
      data_gen.skillParams['chain']['UltimateRequiemForTheNightBurial'],
  },
  assist: {
    AssistMoreOvertime: data_gen.skillParams['assist']['AssistMoreOvertime'],
    QuickAssistAtYourService:
      data_gen.skillParams['assist']['QuickAssistAtYourService'],
    DefensiveAssistAllowMeToAssist:
      data_gen.skillParams['assist']['DefensiveAssistAllowMeToAssist'],
    AssistFollowUpMidnightCode:
      data_gen.skillParams['assist']['AssistFollowUpMidnightCode'],
  },
  core: {
    windEnergy: data_gen.coreParams[0][0],
    energyConsumed: data_gen.coreParams[1][0],
    maxWindEnergy: data_gen.coreParams[2][0],
    initEnerRegen: data_gen.coreParams[3][0],
    enerRegenStep: data_gen.coreParams[4][0],
    atk: data_gen.coreParams[5][0],
    maxAtk: data_gen.coreParams[6],
    impact: data_gen.coreParams[7][0],
    maxImpact: data_gen.coreParams[8],
    crit_step: data_gen.coreParams[9][0],
    crit_dmg_: data_gen.coreParams[10][0],
    max_crit_dmg_: data_gen.coreParams[11],
    laceration_dmg_: data_gen.coreParams[12][0],
    max_laceration_dmg_: data_gen.coreParams[13],
    duration: data_gen.coreParams[14],
  },
  ability: {
    common_dmg_: data_gen.abilityParams[0],
    dmg_step: data_gen.abilityParams[1],
    max_dmg_: data_gen.abilityParams[2],
    stun_: data_gen.abilityParams[3],
    stunExtension: data_gen.abilityParams[4],
    direct_dmg_: data_gen.abilityParams[5],
    energy: data_gen.abilityParams[6],
    cooldown: data_gen.abilityParams[7],
    windsweptDuration: data_gen.abilityParams[8],
    anomBuildup_: data_gen.abilityParams[9],
    duration: data_gen.abilityParams[10],
  },
  m1: {
    resRed_: data_gen.mindscapeParams[0][0],
    duration: data_gen.mindscapeParams[0][1],
    crit_dmg_: data_gen.mindscapeParams[0][2],
  },
  m2: {
    dazeInc_: data_gen.mindscapeParams[1][0],
    windflow: data_gen.mindscapeParams[1][1],
    maxWindflow: data_gen.mindscapeParams[1][2],
    whirlwindDuration: data_gen.mindscapeParams[1][3],
    maxWhirlwindDuration: data_gen.mindscapeParams[1][4],
    stun_: data_gen.mindscapeParams[1][5],
  },
  m4: {
    energy: data_gen.mindscapeParams[3][0],
    moreEnergy: data_gen.mindscapeParams[3][1],
    dmg_: data_gen.mindscapeParams[3][2],
    dazeInc_: data_gen.mindscapeParams[3][3],
  },
  m6: {
    windResIgn_: data_gen.mindscapeParams[5][0],
    cooldown: data_gen.mindscapeParams[5][1],
    maxWindstorms: data_gen.mindscapeParams[5][2],
    mv_mult_: data_gen.mindscapeParams[5][3],
    dazeInc_: data_gen.mindscapeParams[5][4],
  },
} as const

export default dm

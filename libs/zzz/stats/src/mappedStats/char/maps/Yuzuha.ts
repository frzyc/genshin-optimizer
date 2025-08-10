import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Yuzuha'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackTanukiClaws:
      data_gen.skillParams['basic']['BasicAttackTanukiClaws'],
    BasicAttackTanukiCloak:
      data_gen.skillParams['basic']['BasicAttackTanukiCloak'],
    BasicAttackHardCandyShot:
      data_gen.skillParams['basic']['BasicAttackHardCandyShot'],
    BasicAttackSugarburstSparkles:
      data_gen.skillParams['basic']['BasicAttackSugarburstSparkles'],
    BasicAttackSugarburstSparklesMax:
      data_gen.skillParams['basic']['BasicAttackSugarburstSparklesMax'],
    BasicAttackTanukiHelper:
      data_gen.skillParams['basic']['BasicAttackTanukiHelper'],
  },
  dodge: {
    DodgeDidIScareYou: data_gen.skillParams['dodge']['DodgeDidIScareYou'],
    DashAttackYoureOuttaLuck:
      data_gen.skillParams['dodge']['DashAttackYoureOuttaLuck'],
    DodgeCounterTimeForPayback:
      data_gen.skillParams['dodge']['DodgeCounterTimeForPayback'],
  },
  special: {
    SpecialAttackGummyBombardment:
      data_gen.skillParams['special']['SpecialAttackGummyBombardment'],
    EXSpecialAttackCavityAlert:
      data_gen.skillParams['special']['EXSpecialAttackCavityAlert'],
    EXSpecialAttackCavityAlertRightNow:
      data_gen.skillParams['special']['EXSpecialAttackCavityAlertRightNow'],
    SweetScare: data_gen.skillParams['special']['SweetScare'],
  },
  chain: {
    ChainAttackPrankAssault:
      data_gen.skillParams['chain']['ChainAttackPrankAssault'],
    UltimateSurrenderOrSufferTheMischief:
      data_gen.skillParams['chain']['UltimateSurrenderOrSufferTheMischief'],
  },
  assist: {
    QuickAssistDessertTime:
      data_gen.skillParams['assist']['QuickAssistDessertTime'],
    DefensiveAssistReplenishYourFun:
      data_gen.skillParams['assist']['DefensiveAssistReplenishYourFun'],
    AssistFollowUpWeHaveCookies:
      data_gen.skillParams['assist']['AssistFollowUpWeHaveCookies'],
    AssistFollowUpStuffedHardCandyShot:
      data_gen.skillParams['assist']['AssistFollowUpStuffedHardCandyShot'],
  },
  core: {
    sugar_points: data_gen.coreParams[0][0],
    max_sugar_points: data_gen.coreParams[1][0],
    atk: data_gen.coreParams[2][0],
    max_atk: data_gen.coreParams[3],
    common_dmg_: data_gen.coreParams[4][0],
    duration: data_gen.coreParams[5][0],
    atk_threshold: data_gen.coreParams[6][0],
  },
  ability: {
    anomMas_threshold: data_gen.abilityParams[0],
    anomBuildup_: data_gen.abilityParams[1],
    max_anomBuildup_: data_gen.abilityParams[2],
    anomaly_disorder_dmg_: data_gen.abilityParams[3],
    max_anomaly_disorder_dmg_: data_gen.abilityParams[4],
    max_anomMas: data_gen.abilityParams[5],
  },
  m1: {
    energy: data_gen.mindscapeParams[0][0],
    cooldown: data_gen.mindscapeParams[0][1],
    resRed_: data_gen.mindscapeParams[0][2],
    buffInc_: data_gen.mindscapeParams[0][3],
  },
  m2: {
    common_dmg_: data_gen.mindscapeParams[1][0],
    anomBuildup_: data_gen.mindscapeParams[1][1],
    duration: data_gen.mindscapeParams[1][2],
    cooldown: data_gen.mindscapeParams[1][3],
    sugar_points: data_gen.mindscapeParams[1][4],
    basic_cooldownRed_: data_gen.mindscapeParams[1][5],
  },
  m4: {
    assistFollowUp_dmg_: data_gen.mindscapeParams[3][0],
    assistFollowUp_anomBuildup_: data_gen.mindscapeParams[3][1],
  },
  m6: {
    sugar_points: data_gen.mindscapeParams[5][0],
    charge_max: data_gen.mindscapeParams[5][1],
    charge_step: data_gen.mindscapeParams[5][2],
    sugar_points_consumed: data_gen.mindscapeParams[5][3],
    dmg: data_gen.mindscapeParams[5][4],
    add_disorder_: data_gen.mindscapeParams[5][5],
    duration: data_gen.mindscapeParams[5][6],
    max_stacks: data_gen.mindscapeParams[5][7],
    basic_triggered: data_gen.mindscapeParams[5][8],
  },
} as const

export default dm

import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'PanYinhu'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackUnyieldingStrikes:
      data_gen.skillParams['basic']['BasicAttackUnyieldingStrikes'],
  },
  dodge: {
    DodgeLightAsASwallow: data_gen.skillParams['dodge']['DodgeLightAsASwallow'],
    DashAttackSizzlingOilSupreme:
      data_gen.skillParams['dodge']['DashAttackSizzlingOilSupreme'],
    DodgeCounterMovingMountainsAndSeas:
      data_gen.skillParams['dodge']['DodgeCounterMovingMountainsAndSeas'],
  },
  special: {
    SpecialAttackSonicPressurePointStrike:
      data_gen.skillParams['special']['SpecialAttackSonicPressurePointStrike'],
    SpecialAttackTouchOfDeath:
      data_gen.skillParams['special']['SpecialAttackTouchOfDeath'],
    EXSpecialAttackMountainousPulseStrike:
      data_gen.skillParams['special']['EXSpecialAttackMountainousPulseStrike'],
  },
  chain: {
    ChainAttackAnointedWithWokSteam:
      data_gen.skillParams['chain']['ChainAttackAnointedWithWokSteam'],
    UltimateAFeastFitForAnEmperor:
      data_gen.skillParams['chain']['UltimateAFeastFitForAnEmperor'],
  },
  assist: {
    QuickAssistLiftYourGazeToGoodFortune:
      data_gen.skillParams['assist']['QuickAssistLiftYourGazeToGoodFortune'],
    DefensiveAssistIntimidatingPresence:
      data_gen.skillParams['assist']['DefensiveAssistIntimidatingPresence'],
    AssistFollowUpRideTheMomentum:
      data_gen.skillParams['assist']['AssistFollowUpRideTheMomentum'],
  },
  core: {
    sheerForce: data_gen.coreParams[0],
    duration: data_gen.coreParams[1][0],
    max_sheerForce: data_gen.coreParams[2][0],
  },
  ability: {
    dmgInc_: data_gen.abilityParams[0],
    duration: data_gen.abilityParams[1],
  },
  m1: {
    dmgInc_: data_gen.mindscapeParams[0][0],
  },
  m2: {
    break_force_step: data_gen.mindscapeParams[1][0],
    energy: data_gen.mindscapeParams[1][1],
    durationInc_: data_gen.mindscapeParams[1][2],
  },
  m4: {
    heal_: data_gen.mindscapeParams[3][0],
    heal_dot_: data_gen.mindscapeParams[3][1],
    heal: data_gen.mindscapeParams[3][2],
  },
  m6: {
    sheerForce: data_gen.mindscapeParams[5][0],
    max_sheerForce: data_gen.mindscapeParams[5][1],
  },
} as const

export default dm

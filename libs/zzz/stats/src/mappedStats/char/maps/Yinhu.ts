import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Yinhu'
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
} as const

export default dm

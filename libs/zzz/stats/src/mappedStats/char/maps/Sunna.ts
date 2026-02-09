import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Sunna'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackMischiefMeteorHammer:
      data_gen.skillParams['basic']['BasicAttackMischiefMeteorHammer'],
    BasicAttackNaughtyCatSpotted:
      data_gen.skillParams['basic']['BasicAttackNaughtyCatSpotted'],
  },
  dodge: {
    DodgeCantHitMe: data_gen.skillParams['dodge']['DodgeCantHitMe'],
    DashAttackSkywardHammer:
      data_gen.skillParams['dodge']['DashAttackSkywardHammer'],
    DodgeCounterDelusionStrikeout:
      data_gen.skillParams['dodge']['DodgeCounterDelusionStrikeout'],
  },
  special: {
    SpecialAttackStarShooter:
      data_gen.skillParams['special']['SpecialAttackStarShooter'],
    EXSpecialAttackBubblegumBarrage:
      data_gen.skillParams['special']['EXSpecialAttackBubblegumBarrage'],
    EXSpecialAttackSpecialPhotographyTechnique:
      data_gen.skillParams['special'][
        'EXSpecialAttackSpecialPhotographyTechnique'
      ],
  },
  chain: {
    ChainAttackDontMessWithTheCat:
      data_gen.skillParams['chain']['ChainAttackDontMessWithTheCat'],
    UltimateSmashItAll: data_gen.skillParams['chain']['UltimateSmashItAll'],
  },
  assist: {
    QuickAssistSonicBeatdown:
      data_gen.skillParams['assist']['QuickAssistSonicBeatdown'],
    DefensiveAssistStageFright:
      data_gen.skillParams['assist']['DefensiveAssistStageFright'],
    AssistFollowUpJumpTraining:
      data_gen.skillParams['assist']['AssistFollowUpJumpTraining'],
  },
} as const

export default dm

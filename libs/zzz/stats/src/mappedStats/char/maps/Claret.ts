import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Claret'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackBloodforgingFourForms:
      data_gen.skillParams['basic']['BasicAttackBloodforgingFourForms'],
    BasicAttackBloodbloomOathStarforging:
      data_gen.skillParams['basic']['BasicAttackBloodbloomOathStarforging'],
    BasicAttackBloodbloomOathSubduingAxe:
      data_gen.skillParams['basic']['BasicAttackBloodbloomOathSubduingAxe'],
  },
  dodge: {
    DodgeNightVision: data_gen.skillParams['dodge']['DodgeNightVision'],
    DashAttackTempering: data_gen.skillParams['dodge']['DashAttackTempering'],
    DodgeCounterReturningEdge:
      data_gen.skillParams['dodge']['DodgeCounterReturningEdge'],
    DodgeCounterBloodbloomOathReturningEdge:
      data_gen.skillParams['dodge']['DodgeCounterBloodbloomOathReturningEdge'],
  },
  special: {
    SpecialAttackPorcelumesFirstCall:
      data_gen.skillParams['special']['SpecialAttackPorcelumesFirstCall'],
    EXSpecialAttackBloodbloomOathSecretForgingTechniques:
      data_gen.skillParams['special'][
        'EXSpecialAttackBloodbloomOathSecretForgingTechniques'
      ],
    SpecialAttackBloodbloomOathCleavingGoldAndIron:
      data_gen.skillParams['special'][
        'SpecialAttackBloodbloomOathCleavingGoldAndIron'
      ],
    SpecialAttackBloodbloomOathBloodBurialAssault:
      data_gen.skillParams['special'][
        'SpecialAttackBloodbloomOathBloodBurialAssault'
      ],
  },
  chain: {
    ChainAttackBloodbloomOathResonantBloodPact:
      data_gen.skillParams['chain'][
        'ChainAttackBloodbloomOathResonantBloodPact'
      ],
    UltimateBloodbloomOathTrialAfterTrial:
      data_gen.skillParams['chain']['UltimateBloodbloomOathTrialAfterTrial'],
  },
  assist: {
    QuickAssistReturnOfTheDireMoon:
      data_gen.skillParams['assist']['QuickAssistReturnOfTheDireMoon'],
    QuickAssistBloodbloomOathReturnOfTheDireMoon:
      data_gen.skillParams['assist'][
        'QuickAssistBloodbloomOathReturnOfTheDireMoon'
      ],
    DefensiveAssistUnyieldingHeartOfTheFurnace:
      data_gen.skillParams['assist'][
        'DefensiveAssistUnyieldingHeartOfTheFurnace'
      ],
    AssistFollowUpBloodbloomOathPureforgedEdge:
      data_gen.skillParams['assist'][
        'AssistFollowUpBloodbloomOathPureforgedEdge'
      ],
    CounterAssistGiveNotAnInchOfSteel:
      data_gen.skillParams['assist']['CounterAssistGiveNotAnInchOfSteel'],
    AssistFollowUpBloodbloomOathHammerIntoShape:
      data_gen.skillParams['assist'][
        'AssistFollowUpBloodbloomOathHammerIntoShape'
      ],
  },
} as const

export default dm

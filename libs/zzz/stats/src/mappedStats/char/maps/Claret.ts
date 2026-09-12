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
  core: {
    gashStacks: data_gen.coreParams[0][0],
    gashConsumed: data_gen.coreParams[1][0],
    crit_threshold: data_gen.coreParams[2][0],
    initial_crit_dmg_: data_gen.coreParams[3][0],
    initial_crit_: data_gen.coreParams[4][0],
    sharpness: data_gen.coreParams[5][0],
    cooldown: data_gen.coreParams[6][0],
    duration: data_gen.coreParams[7][0],
    crit_: data_gen.coreParams[8],
    gashBuildupRate_: data_gen.coreParams[9],
    dmg_: data_gen.coreParams[10][0],
  },
  ability: {
    decibels: data_gen.abilityParams[0],
    cooldown: data_gen.abilityParams[1],
    laceration_dmg_: data_gen.abilityParams[2],
    duration: data_gen.abilityParams[3],
  },
  m1: {
    gashBuildupRate_: data_gen.mindscapeParams[0][0],
    maim_mult_: data_gen.mindscapeParams[0][1]
  },
  m2: {
    duration: data_gen.mindscapeParams[1][0],
    electric_resIgn_: data_gen.mindscapeParams[1][1],
  },
  m4: {
    dmg_: data_gen.mindscapeParams[3][0],
  },
  m6: {
    maim: data_gen.mindscapeParams[5][0],
  }
} as const

export default dm

import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Lucia'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackOrbitalCombo:
      data_gen.skillParams['basic']['BasicAttackOrbitalCombo'],
  },
  dodge: {
    DodgeFadingSilhouette:
      data_gen.skillParams['dodge']['DodgeFadingSilhouette'],
    DashAttackRefraction: data_gen.skillParams['dodge']['DashAttackRefraction'],
    DodgeCounterStardustEcho:
      data_gen.skillParams['dodge']['DodgeCounterStardustEcho'],
  },
  special: {
    SpecialAttackSymphonyOfTheReaperStorm:
      data_gen.skillParams['special']['SpecialAttackSymphonyOfTheReaperStorm'],
    EXSpecialAttackSymphonyOfTheReaperDaybreak:
      data_gen.skillParams['special'][
        'EXSpecialAttackSymphonyOfTheReaperDaybreak'
      ],
  },
  chain: {
    ChainAttackStageOfBrilliance:
      data_gen.skillParams['chain']['ChainAttackStageOfBrilliance'],
    UltimateChargeGreatArmor:
      data_gen.skillParams['chain']['UltimateChargeGreatArmor'],
  },
  assist: {
    QuickAssistCrushingMist:
      data_gen.skillParams['assist']['QuickAssistCrushingMist'],
    DefensiveAssistVoiceOfIllusoryDreams:
      data_gen.skillParams['assist']['DefensiveAssistVoiceOfIllusoryDreams'],
    AssistFollowUpHarmonyOfPaintedDreams:
      data_gen.skillParams['assist']['AssistFollowUpHarmonyOfPaintedDreams'],
  },
  core: {
    dreamPoints: data_gen.coreParams[0][0],
    dreamPointsThreshold: data_gen.coreParams[1][0],
    hp_: data_gen.coreParams[2][0],
    duration: data_gen.coreParams[3][0],
    maxDuration: data_gen.coreParams[4][0],
    dreamPointsConsumed1: data_gen.coreParams[5][0],
    dreamPointsConsumed2: data_gen.coreParams[6][0],
    cooldown: data_gen.coreParams[7][0],
    common_dmg_: data_gen.coreParams[8],
    buffDuration: data_gen.coreParams[9][0],
  },
  ability: {
    crit_dmg_: data_gen.abilityParams[0],
  },
  m1: {
    resIgn_: data_gen.mindscapeParams[0][0],
    decibelGen_: data_gen.mindscapeParams[0][1],
    echo: data_gen.mindscapeParams[0][2],
    stacks: data_gen.mindscapeParams[0][3],
    stacksConsumed: data_gen.mindscapeParams[0][4],
  },
  m2: {
    harmony_dmg_: data_gen.mindscapeParams[1][0],
    sheer_dmg_: data_gen.mindscapeParams[1][1],
  },
  m4: {
    decibels: data_gen.mindscapeParams[3][0],
    cooldown: data_gen.mindscapeParams[3][1],
  },
  m6: {
    atk_: data_gen.mindscapeParams[5][0],
    harmony_crit_dmg_: data_gen.mindscapeParams[5][1],
  },
} as const

export default dm

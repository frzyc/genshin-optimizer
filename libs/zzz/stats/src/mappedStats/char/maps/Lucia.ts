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
} as const

export default dm

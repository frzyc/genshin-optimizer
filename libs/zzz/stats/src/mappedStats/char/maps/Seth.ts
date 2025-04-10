import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Seth'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackLightningStrike:
      data_gen.skillParams['basic']['BasicAttackLightningStrike'],
    BasicAttackLightningStrikeElectrified:
      data_gen.skillParams['basic']['BasicAttackLightningStrikeElectrified'],
  },
  dodge: {
    DodgeEvasionManeuver: data_gen.skillParams['dodge']['DodgeEvasionManeuver'],
    DashAttackThunderAssault:
      data_gen.skillParams['dodge']['DashAttackThunderAssault'],
    DodgeCounterRetreatToAdvance:
      data_gen.skillParams['dodge']['DodgeCounterRetreatToAdvance'],
  },
  special: {
    SpecialAttackThunderShieldRush:
      data_gen.skillParams['special']['SpecialAttackThunderShieldRush'],
    EXSpecialAttackThunderShieldRushHighVoltage:
      data_gen.skillParams['special'][
        'EXSpecialAttackThunderShieldRushHighVoltage'
      ],
  },
  chain: {
    ChainAttackFinalJudgement:
      data_gen.skillParams['chain']['ChainAttackFinalJudgement'],
    UltimateJusticePrevails:
      data_gen.skillParams['chain']['UltimateJusticePrevails'],
  },
  assist: {
    QuickAssistArmedSupport:
      data_gen.skillParams['assist']['QuickAssistArmedSupport'],
    DefensiveAssistThundershield:
      data_gen.skillParams['assist']['DefensiveAssistThundershield'],
    AssistFollowUpPublicSecurityRuling:
      data_gen.skillParams['assist']['AssistFollowUpPublicSecurityRuling'],
  },
} as const

export default dm

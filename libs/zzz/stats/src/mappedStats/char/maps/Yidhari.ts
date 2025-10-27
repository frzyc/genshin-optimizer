import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Yidhari'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackCrushingStrike:
      data_gen.skillParams['basic']['BasicAttackCrushingStrike'],
    BasicAttackFrostbiteEmbrace:
      data_gen.skillParams['basic']['BasicAttackFrostbiteEmbrace'],
    FrostsCrushingWeight: data_gen.skillParams['basic']['FrostsCrushingWeight'],
  },
  dodge: {
    DodgeDreamshift: data_gen.skillParams['dodge']['DodgeDreamshift'],
    DashAttackFrostbloomImpact:
      data_gen.skillParams['dodge']['DashAttackFrostbloomImpact'],
    DodgeCounterIcehaulReverb:
      data_gen.skillParams['dodge']['DodgeCounterIcehaulReverb'],
  },
  special: {
    SpecialAttackCeaseThoughts:
      data_gen.skillParams['special']['SpecialAttackCeaseThoughts'],
    EXSpecialAttackFrostCoil:
      data_gen.skillParams['special']['EXSpecialAttackFrostCoil'],
    SpecialAttackSurgingColdCrushingPursuit:
      data_gen.skillParams['special'][
        'SpecialAttackSurgingColdCrushingPursuit'
      ],
    EXSpecialAttackGlacialCrush:
      data_gen.skillParams['special']['EXSpecialAttackGlacialCrush'],
  },
  chain: {
    ChainAttackFrostboundOath:
      data_gen.skillParams['chain']['ChainAttackFrostboundOath'],
    EtherVeilWellspring: data_gen.skillParams['chain']['EtherVeilWellspring'],
    UltimateFinalActCrossingTheRiverOfRegret:
      data_gen.skillParams['chain']['UltimateFinalActCrossingTheRiverOfRegret'],
  },
  assist: {
    QuickAssistFrostshockReinforcement:
      data_gen.skillParams['assist']['QuickAssistFrostshockReinforcement'],
    DefensiveAssistFlashquakeRejection:
      data_gen.skillParams['assist']['DefensiveAssistFlashquakeRejection'],
    AssistFollowUpGlacialOnslaught:
      data_gen.skillParams['assist']['AssistFollowUpGlacialOnslaught'],
  },
} as const

export default dm

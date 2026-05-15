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
  core: {
    hpStep: data_gen.coreParams[0][0],
    sheerForce: data_gen.coreParams[1][0],
    adrenaline: data_gen.coreParams[2][0],
    cooldown: data_gen.coreParams[3][0],
    hpThreshold1: data_gen.coreParams[4][0],
    common_dmg_: data_gen.coreParams[5],
    hpThreshold2: data_gen.coreParams[6][0],
    lingerDuration: data_gen.coreParams[7][0],
    hpStepDecibels: data_gen.coreParams[8][0],
    decibelGain: data_gen.coreParams[9][0],
  },
  ability: {
    hpThreshold: data_gen.abilityParams[0],
    crit_dmg_: data_gen.abilityParams[1],
    dmgRed_: data_gen.abilityParams[2],
    chargedAttackLevel: data_gen.abilityParams[3],
    cooldown: data_gen.abilityParams[4],
  },
  m1: {
    adrenalineCostRed: data_gen.mindscapeParams[0][0],
    adrenalineConsumed: data_gen.mindscapeParams[0][1],
    healingIncrease: data_gen.mindscapeParams[0][2],
    ice_resIgn_: data_gen.mindscapeParams[0][3],
  },
  m2: {
    crit_dmg_: data_gen.mindscapeParams[1][0],
    adrenalineRegen: data_gen.mindscapeParams[1][1],
    duration: data_gen.mindscapeParams[1][2],
  },
  m4: {
    decibelGain: data_gen.mindscapeParams[3][0],
    hp_: data_gen.mindscapeParams[3][1],
  },
  m6: {
    duration: data_gen.mindscapeParams[5][0],
    sheer_dmg_: data_gen.mindscapeParams[5][1],
    hpReducedTo: data_gen.mindscapeParams[5][2],
    invDuration: data_gen.mindscapeParams[5][3],
    healing: data_gen.mindscapeParams[5][4],
  },
} as const

export default dm

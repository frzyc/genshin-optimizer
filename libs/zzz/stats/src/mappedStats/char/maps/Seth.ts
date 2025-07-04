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
    ChainAttackFinalJudgment:
      data_gen.skillParams['chain']['ChainAttackFinalJudgment'],
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
  core: {
    shield: data_gen.coreParams[0],
    max_shield: data_gen.coreParams[1][0],
    duration: data_gen.coreParams[2],
    cooldown: data_gen.coreParams[3][0],
    shield1: data_gen.coreParams[4],
    max_shield1: data_gen.coreParams[5][0],
    duration1: data_gen.coreParams[6][0],
    cooldown1: data_gen.coreParams[7][0],
    anomProf: data_gen.coreParams[8],
  },
  ability: {
    anomBuildupRes_: data_gen.abilityParams[0],
    duration: data_gen.abilityParams[1],
  },
  m1: {
    shield_: data_gen.mindscapeParams[0][0],
    duration: data_gen.mindscapeParams[0][1],
  },
  m2: {
    resolve: data_gen.mindscapeParams[1][0],
    electric_anomBuildup_: data_gen.mindscapeParams[1][1],
  },
  m4: {
    dazeInc_: data_gen.mindscapeParams[3][0],
  },
  m6: {
    dmg: data_gen.mindscapeParams[5][0],
    crit_dmg_: data_gen.mindscapeParams[5][1],
  },
} as const

export default dm

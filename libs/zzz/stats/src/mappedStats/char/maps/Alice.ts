import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Alice'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackCelestialOverture:
      data_gen.skillParams['basic']['BasicAttackCelestialOverture'],
    BasicAttackStarshineWaltz:
      data_gen.skillParams['basic']['BasicAttackStarshineWaltz'],
  },
  dodge: {
    DodgeJumpyBunny: data_gen.skillParams['dodge']['DodgeJumpyBunny'],
    DashAttackBladeDancersGale:
      data_gen.skillParams['dodge']['DashAttackBladeDancersGale'],
    DodgeCounterCeremonyOfSwordlight:
      data_gen.skillParams['dodge']['DodgeCounterCeremonyOfSwordlight'],
  },
  special: {
    SpecialAttackPiercingDawn:
      data_gen.skillParams['special']['SpecialAttackPiercingDawn'],
    EXSpecialAttackAuroraThrustNorthernCross:
      data_gen.skillParams['special'][
        'EXSpecialAttackAuroraThrustNorthernCross'
      ],
    EXSpecialAttackAuroraThrustSouthernCross:
      data_gen.skillParams['special'][
        'EXSpecialAttackAuroraThrustSouthernCross'
      ],
  },
  chain: {
    ChainAttackStarfallIntermission:
      data_gen.skillParams['chain']['ChainAttackStarfallIntermission'],
    UltimateStarfallFinale:
      data_gen.skillParams['chain']['UltimateStarfallFinale'],
  },
  assist: {
    QuickAssistIntertwinedStab:
      data_gen.skillParams['assist']['QuickAssistIntertwinedStab'],
    DefensiveAssistParryGuard:
      data_gen.skillParams['assist']['DefensiveAssistParryGuard'],
    AssistFollowUpCrossRiposte:
      data_gen.skillParams['assist']['AssistFollowUpCrossRiposte'],
  },
  core: {
    cooldown: data_gen.coreParams[0][0],
    dmg: data_gen.coreParams[1][0],
    anomaly_remaining: data_gen.coreParams[2][0],
    addl_disorder_: data_gen.coreParams[3][0],
    max_addl_disorder_: data_gen.coreParams[4][0],
    blade_etiquette_gained: data_gen.coreParams[6][0],
    max_blade_etiquette: data_gen.coreParams[7][0],
    blade_etiquette_step: data_gen.coreParams[8][0],
    bar: data_gen.coreParams[9][0],
    physical_anomBuildup_: data_gen.coreParams[12],
    duration: data_gen.coreParams[13][0],
  },
  ability: {
    blade_etiquette_gained: data_gen.abilityParams[0],
    anomMas_threshold: data_gen.abilityParams[1],
    anomProf: data_gen.abilityParams[2],
    blade_etiquette_gained2: data_gen.abilityParams[3],
    cooldown: data_gen.abilityParams[4],
  },
  m1: {
    blade_etiquette_gained: data_gen.mindscapeParams[0][0],
    defRed_: data_gen.mindscapeParams[0][1],
    duration: data_gen.mindscapeParams[0][2],
  },
  m2: {
    physical_buff_: data_gen.mindscapeParams[1][0],
    disorder_buff_: data_gen.mindscapeParams[1][1],
    decibels: data_gen.mindscapeParams[1][2],
    cooldown: data_gen.mindscapeParams[1][3],
  },
  m4: {
    physical_resIgn_: data_gen.mindscapeParams[3][0],
    physical_anomBuildup_: data_gen.mindscapeParams[3][1],
  },
  m6: {
    victory_state: data_gen.mindscapeParams[5][0],
    dmg: data_gen.mindscapeParams[5][1],
    cooldown: data_gen.mindscapeParams[5][2],
    max_triggers: data_gen.mindscapeParams[5][3],
  },
} as const

export default dm

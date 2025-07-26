import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Yanagi'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackTsukuyomiKagura:
      data_gen.skillParams['basic']['BasicAttackTsukuyomiKagura'],
    StanceJougen: data_gen.skillParams['basic']['StanceJougen'],
    StanceKagen: data_gen.skillParams['basic']['StanceKagen'],
  },
  dodge: {
    DodgeWanderingBreeze: data_gen.skillParams['dodge']['DodgeWanderingBreeze'],
    DashAttackFleetingFlight:
      data_gen.skillParams['dodge']['DashAttackFleetingFlight'],
    DodgeCounterRapidRetaliation:
      data_gen.skillParams['dodge']['DodgeCounterRapidRetaliation'],
  },
  special: {
    SpecialAttackRuten: data_gen.skillParams['special']['SpecialAttackRuten'],
    EXSpecialAttackGekkaRuten:
      data_gen.skillParams['special']['EXSpecialAttackGekkaRuten'],
  },
  chain: {
    ChainAttackCelestialHarmony:
      data_gen.skillParams['chain']['ChainAttackCelestialHarmony'],
    UltimateRaieiTenge: data_gen.skillParams['chain']['UltimateRaieiTenge'],
  },
  assist: {
    QuickAssistBladeOfElegance:
      data_gen.skillParams['assist']['QuickAssistBladeOfElegance'],
    DefensiveAssistRadiantReversal:
      data_gen.skillParams['assist']['DefensiveAssistRadiantReversal'],
    AssistFollowUpWeepingWillowStab:
      data_gen.skillParams['assist']['AssistFollowUpWeepingWillowStab'],
  },
  core: {
    add_disorder_: data_gen.coreParams[0],
    duration: data_gen.coreParams[1][0],
    electric_dmg_: data_gen.coreParams[2],
    duration1: data_gen.coreParams[3][0],
  },
  ability: {
    electric_anomBuildup_: data_gen.abilityParams[0],
    duration: data_gen.abilityParams[1],
  },
  m1: {
    clarity_gained: data_gen.mindscapeParams[0][0],
    duration: data_gen.mindscapeParams[0][1],
    max_stacks: data_gen.mindscapeParams[0][2],
    consumed_stacks: data_gen.mindscapeParams[0][3],
    inv_duration: data_gen.mindscapeParams[0][4],
    stack_threshold: data_gen.mindscapeParams[0][5],
    anomProf: data_gen.mindscapeParams[0][6],
  },
  m2: {
    electric_anomBuildup_: data_gen.mindscapeParams[1][0],
    energy_consumed: data_gen.mindscapeParams[1][1],
    polarity_disorder_mv_: data_gen.mindscapeParams[1][2],
    add_polarity_disorder_mv_: data_gen.mindscapeParams[1][3],
    max_stacks: data_gen.mindscapeParams[1][4],
  },
  m4: {
    duration: data_gen.mindscapeParams[3][0],
    pen_: data_gen.mindscapeParams[3][1],
  },
  m6: {
    duration: data_gen.mindscapeParams[5][0],
    exSpecial_dmg_: data_gen.mindscapeParams[5][1],
    max_stacks: data_gen.mindscapeParams[5][2],
    reduced_energy_hits: data_gen.mindscapeParams[5][3],
  },
} as const

export default dm

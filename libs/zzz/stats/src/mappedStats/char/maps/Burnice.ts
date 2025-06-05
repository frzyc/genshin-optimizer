import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Burnice'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackDirectFlameBlend:
      data_gen.skillParams['basic']['BasicAttackDirectFlameBlend'],
    BasicAttackMixedFlameBlend:
      data_gen.skillParams['basic']['BasicAttackMixedFlameBlend'],
  },
  dodge: {
    DodgeFieryPhantomDash:
      data_gen.skillParams['dodge']['DodgeFieryPhantomDash'],
    DashAttackDangerousFermentation:
      data_gen.skillParams['dodge']['DashAttackDangerousFermentation'],
    DodgeCounterFlutteringSteps:
      data_gen.skillParams['dodge']['DodgeCounterFlutteringSteps'],
  },
  special: {
    SpecialAttackIntenseHeatAgingMethod:
      data_gen.skillParams['special']['SpecialAttackIntenseHeatAgingMethod'],
    EXSpecialAttackIntenseHeatStirringMethod:
      data_gen.skillParams['special'][
        'EXSpecialAttackIntenseHeatStirringMethod'
      ],
    EXSpecialAttackIntenseHeatStirringMethodDoubleShot:
      data_gen.skillParams['special'][
        'EXSpecialAttackIntenseHeatStirringMethodDoubleShot'
      ],
  },
  chain: {
    ChainAttackFuelFedFlame:
      data_gen.skillParams['chain']['ChainAttackFuelFedFlame'],
    UltimateGloriousInferno:
      data_gen.skillParams['chain']['UltimateGloriousInferno'],
  },
  assist: {
    QuickAssistEnergizingSpecialtyDrink:
      data_gen.skillParams['assist']['QuickAssistEnergizingSpecialtyDrink'],
    DefensiveAssistSmokyCauldron:
      data_gen.skillParams['assist']['DefensiveAssistSmokyCauldron'],
    AssistFollowUpScorchingDew:
      data_gen.skillParams['assist']['AssistFollowUpScorchingDew'],
  },
  core: {
    heat: data_gen.coreParams[0][0],
    heat_gain: data_gen.coreParams[1][0],
    energy_consumed: data_gen.coreParams[2][0],
    heat_threshold: data_gen.coreParams[3][0],
    battle_start_heat: data_gen.coreParams[4][0],
    heat_expended: data_gen.coreParams[5][0],
    afterburn_dmg: data_gen.coreParams[6],
    cooldown: data_gen.coreParams[7][0],
    anomProf_step: data_gen.coreParams[8][0],
    afterburn_dmg_: data_gen.coreParams[9][0],
    max_afterburn_dmg_: data_gen.coreParams[10][0],
  },
  ability: {
    fire_anomBuildup: data_gen.abilityParams[0],
    duration_extension: data_gen.abilityParams[1],
  },
  m1: {
    initial_heat: data_gen.mindscapeParams[0][0],
    heat_limit: data_gen.mindscapeParams[0][1],
    additional_heat: data_gen.mindscapeParams[0][2],
    afterburn_dmg: data_gen.mindscapeParams[0][3],
    afterburn_fire_anomBuildup_: data_gen.mindscapeParams[0][4],
  },
  m2: {
    stacks: data_gen.mindscapeParams[1][0],
    duration: data_gen.mindscapeParams[1][1],
    pen_: data_gen.mindscapeParams[1][2],
    max_pen_: data_gen.mindscapeParams[1][3],
  },
  m4: {
    exSpecial_assist_crit_: data_gen.mindscapeParams[3][0],
    spray_duration_increase: data_gen.mindscapeParams[3][1],
  },
  m6: {
    special_afterburn_dmg: data_gen.mindscapeParams[5][0],
    special_cooldown: data_gen.mindscapeParams[5][1],
    exSpecial_specialAfterburn_burn_fire_resIgn_:
      data_gen.mindscapeParams[5][2],
    additional_burn_dmg: data_gen.mindscapeParams[5][3],
    additional_cooldown: data_gen.mindscapeParams[5][4],
  },
} as const

export default dm

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
} as const

export default dm

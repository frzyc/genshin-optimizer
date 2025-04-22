import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Lighter'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackLFormThunderingFist:
      data_gen.skillParams['basic']['BasicAttackLFormThunderingFist'],
  },
  dodge: {
    DodgeShadowedSlide: data_gen.skillParams['dodge']['DodgeShadowedSlide'],
    DashAttackChargingSlam:
      data_gen.skillParams['dodge']['DashAttackChargingSlam'],
    DodgeCounterBlazingFlash:
      data_gen.skillParams['dodge']['DodgeCounterBlazingFlash'],
  },
  special: {
    SpecialAttackVFormSunriseUppercut:
      data_gen.skillParams['special']['SpecialAttackVFormSunriseUppercut'],
    EXSpecialAttackVFormSunriseUppercutFullDistance:
      data_gen.skillParams['special'][
        'EXSpecialAttackVFormSunriseUppercutFullDistance'
      ],
  },
  chain: {
    ChainAttackVFormScorchingSun:
      data_gen.skillParams['chain']['ChainAttackVFormScorchingSun'],
    UltimateWFormCrownedInferno:
      data_gen.skillParams['chain']['UltimateWFormCrownedInferno'],
  },
  assist: {
    QuickAssistBlazingFlashGuard:
      data_gen.skillParams['assist']['QuickAssistBlazingFlashGuard'],
    DefensiveAssistSwiftBreak:
      data_gen.skillParams['assist']['DefensiveAssistSwiftBreak'],
    AssistFollowUpChargingSlamStab:
      data_gen.skillParams['assist']['AssistFollowUpChargingSlamStab'],
  },
} as const

export default dm

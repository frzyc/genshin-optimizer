import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Seed'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackChrysanthemumWheelDance:
      data_gen.skillParams['basic']['BasicAttackChrysanthemumWheelDance'],
    BasicAttackFallingPetalsSlaughter:
      data_gen.skillParams['basic']['BasicAttackFallingPetalsSlaughter'],
    BasicAttackFallingPetalsDownfall:
      data_gen.skillParams['basic']['BasicAttackFallingPetalsDownfall'],
    BasicAttackFallingPetalsDownfallFirstForm:
      data_gen.skillParams['basic'][
        'BasicAttackFallingPetalsDownfallFirstForm'
      ],
    BasicAttackFallingPetalsDownfallSecondForm:
      data_gen.skillParams['basic'][
        'BasicAttackFallingPetalsDownfallSecondForm'
      ],
  },
  dodge: {
    DodgeRunningOnPetals: data_gen.skillParams['dodge']['DodgeRunningOnPetals'],
    DashAttackMagneticWheelDance:
      data_gen.skillParams['dodge']['DashAttackMagneticWheelDance'],
    DodgeCounterBlossomBurst:
      data_gen.skillParams['dodge']['DodgeCounterBlossomBurst'],
  },
  special: {
    SpecialAttackWitheredInFrost:
      data_gen.skillParams['special']['SpecialAttackWitheredInFrost'],
    EXSpecialAttackRainingIronPetals:
      data_gen.skillParams['special']['EXSpecialAttackRainingIronPetals'],
    EXSpecialAttackRainingIronPetalsAway:
      data_gen.skillParams['special']['EXSpecialAttackRainingIronPetalsAway'],
  },
  chain: {
    ChainAttackTempestOfFrostyPetals:
      data_gen.skillParams['chain']['ChainAttackTempestOfFrostyPetals'],
    UltimateClockworkGardenBloom:
      data_gen.skillParams['chain']['UltimateClockworkGardenBloom'],
  },
  assist: {
    QuickAssistBarrageOfRainingFlowers:
      data_gen.skillParams['assist']['QuickAssistBarrageOfRainingFlowers'],
    DefensiveAssistSproutingBarrier:
      data_gen.skillParams['assist']['DefensiveAssistSproutingBarrier'],
    AssistFollowUpCrimsonCoreBurst:
      data_gen.skillParams['assist']['AssistFollowUpCrimsonCoreBurst'],
  },
} as const

export default dm

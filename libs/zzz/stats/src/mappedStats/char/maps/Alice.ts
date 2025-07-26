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
} as const

export default dm

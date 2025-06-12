import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Qingyi'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackPenultimate:
      data_gen.skillParams['basic']['BasicAttackPenultimate'],
    BasicAttackEnchantedBlossoms:
      data_gen.skillParams['basic']['BasicAttackEnchantedBlossoms'],
    FlashConnect: data_gen.skillParams['basic']['FlashConnect'],
    BasicAttackEnchantedMoonlitBlossoms:
      data_gen.skillParams['basic']['BasicAttackEnchantedMoonlitBlossoms'],
  },
  dodge: {
    DodgeSwanSong: data_gen.skillParams['dodge']['DodgeSwanSong'],
    DashAttackBreach: data_gen.skillParams['dodge']['DashAttackBreach'],
    DodgeCounterLingeringSentiments:
      data_gen.skillParams['dodge']['DodgeCounterLingeringSentiments'],
  },
  special: {
    SpecialAttackSunlitGlory:
      data_gen.skillParams['special']['SpecialAttackSunlitGlory'],
    EXSpecialAttackMoonlitBegonia:
      data_gen.skillParams['special']['EXSpecialAttackMoonlitBegonia'],
  },
  chain: {
    ChainAttackTranquilSerenade:
      data_gen.skillParams['chain']['ChainAttackTranquilSerenade'],
    UltimateEightSoundsOfGanzhou:
      data_gen.skillParams['chain']['UltimateEightSoundsOfGanzhou'],
  },
  assist: {
    QuickAssistWindThroughThePines:
      data_gen.skillParams['assist']['QuickAssistWindThroughThePines'],
    DefensiveAssistGracefulEmbellishment:
      data_gen.skillParams['assist']['DefensiveAssistGracefulEmbellishment'],
    AssistFollowUpSongOfTheClearRiver:
      data_gen.skillParams['assist']['AssistFollowUpSongOfTheClearRiver'],
  },
} as const

export default dm

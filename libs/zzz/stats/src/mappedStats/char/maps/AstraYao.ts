import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'AstraYao'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackCapriccio: data_gen.skillParams['basic']['BasicAttackCapriccio'],
    BasicAttackInterlude: data_gen.skillParams['basic']['BasicAttackInterlude'],
    BasicAttackChorus: data_gen.skillParams['basic']['BasicAttackChorus'],
    BasicAttackFinale: data_gen.skillParams['basic']['BasicAttackFinale'],
  },
  dodge: {
    DodgeMiniWaltz: data_gen.skillParams['dodge']['DodgeMiniWaltz'],
    DashAttackLunarEclipseMelody:
      data_gen.skillParams['dodge']['DashAttackLunarEclipseMelody'],
    DodgeCounterUmbrellaWaltz:
      data_gen.skillParams['dodge']['DodgeCounterUmbrellaWaltz'],
  },
  special: {
    SpecialAttackWindchimesOaths:
      data_gen.skillParams['special']['SpecialAttackWindchimesOaths'],
    IdyllicCadenza: data_gen.skillParams['special']['IdyllicCadenza'],
    Chord: data_gen.skillParams['special']['Chord'],
  },
  chain: {
    ChainAttackTipsyConcerto:
      data_gen.skillParams['chain']['ChainAttackTipsyConcerto'],
    UltimateFantasianSonata:
      data_gen.skillParams['chain']['UltimateFantasianSonata'],
  },
  assist: {
    QuickAssistOneLuminousSky:
      data_gen.skillParams['assist']['QuickAssistOneLuminousSky'],
    EvasiveAssistTwoHearts:
      data_gen.skillParams['assist']['EvasiveAssistTwoHearts'],
    AssistFollowUpThreeLifetimesOfFate:
      data_gen.skillParams['assist']['AssistFollowUpThreeLifetimesOfFate'],
  },
} as const

export default dm

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
} as const

export default dm

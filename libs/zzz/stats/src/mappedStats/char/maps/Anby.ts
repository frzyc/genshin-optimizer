import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Anby'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackTurboVolt: data_gen.skillParams['basic']['BasicAttackTurboVolt'],
    BasicAttackThunderbolt:
      data_gen.skillParams['basic']['BasicAttackThunderbolt'],
  },
  dodge: {
    DodgeSlide: data_gen.skillParams['dodge']['DodgeSlide'],
    DashAttackTaserBlast: data_gen.skillParams['dodge']['DashAttackTaserBlast'],
    DodgeCounterThunderclap:
      data_gen.skillParams['dodge']['DodgeCounterThunderclap'],
  },
  special: {
    SpecialAttackForkLightning:
      data_gen.skillParams['special']['SpecialAttackForkLightning'],
    EXSpecialAttackLightningBolt:
      data_gen.skillParams['special']['EXSpecialAttackLightningBolt'],
  },
  chain: {
    ChainAttackElectroEngine:
      data_gen.skillParams['chain']['ChainAttackElectroEngine'],
    UltimateOverdriveEngine:
      data_gen.skillParams['chain']['UltimateOverdriveEngine'],
  },
  assist: {
    QuickAssistThunderfall:
      data_gen.skillParams['assist']['QuickAssistThunderfall'],
    DefensiveAssistFlash:
      data_gen.skillParams['assist']['DefensiveAssistFlash'],
    AssistFollowUpLightningWhirl:
      data_gen.skillParams['assist']['AssistFollowUpLightningWhirl'],
  },
} as const

export default dm

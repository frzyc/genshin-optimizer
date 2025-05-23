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
  core: {
    basic_ex_3rdHit_daze_: data_gen.coreParams[0],
  },
  ability: {
    energyRegen: data_gen.abilityParams[0],
    cd: data_gen.abilityParams[1],
  },
  m1: {
    ener_: data_gen.mindscapeParams[0][0],
    duration: data_gen.mindscapeParams[0][1],
  },
  m2: {
    dmg_: data_gen.mindscapeParams[1][0],
    daze_: data_gen.mindscapeParams[1][1],
  },
  m4: {
    energyRegen: data_gen.mindscapeParams[3][0],
    energyRatio_: data_gen.mindscapeParams[3][1],
    addlEnergy: data_gen.mindscapeParams[3][2],
    maxEnergy: data_gen.mindscapeParams[3][3],
  },
  m6: {
    charge: data_gen.mindscapeParams[5][0],
    maxCharge: data_gen.mindscapeParams[5][1],
    chargeConsume: data_gen.mindscapeParams[5][2],
    dmg_: data_gen.mindscapeParams[5][3],
  },
} as const

export default dm

import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Billy'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackFullFirepower:
      data_gen.skillParams['basic']['BasicAttackFullFirepower'],
  },
  dodge: {
    DodgeRiskyBusiness: data_gen.skillParams['dodge']['DodgeRiskyBusiness'],
    DashAttackStarlightSanction:
      data_gen.skillParams['dodge']['DashAttackStarlightSanction'],
    DodgeCounterFairFight:
      data_gen.skillParams['dodge']['DodgeCounterFairFight'],
  },
  special: {
    SpecialAttackStandStill:
      data_gen.skillParams['special']['SpecialAttackStandStill'],
    EXSpecialAttackClearanceTime:
      data_gen.skillParams['special']['EXSpecialAttackClearanceTime'],
  },
  chain: {
    ChainAttackStarlightMirage:
      data_gen.skillParams['chain']['ChainAttackStarlightMirage'],
    UltimateStarlightShineBright:
      data_gen.skillParams['chain']['UltimateStarlightShineBright'],
  },
  assist: {
    QuickAssistPowerOfTeamwork:
      data_gen.skillParams['assist']['QuickAssistPowerOfTeamwork'],
    EvasiveAssistFlashSpin:
      data_gen.skillParams['assist']['EvasiveAssistFlashSpin'],
    AssistFollowUpFatalShot:
      data_gen.skillParams['assist']['AssistFollowUpFatalShot'],
  },
  core: {
    common_dmg_: data_gen.coreParams[0],
  },
  ability: {
    ult_dmg_: data_gen.abilityParams[0],
    stacks: data_gen.abilityParams[1],
  },
  m1: {
    energy: data_gen.mindscapeParams[0][0],
    cooldown: data_gen.mindscapeParams[0][1],
  },
  m2: {
    dodgeCounter_dmg_: data_gen.mindscapeParams[1][0],
  },
  m4: {
    exSpecial_crit_: data_gen.mindscapeParams[3][0],
  },
  m6: {
    hits: data_gen.mindscapeParams[5][0],
    dmg_: data_gen.mindscapeParams[5][1],
    stacks: data_gen.mindscapeParams[5][2],
  },
} as const

export default dm

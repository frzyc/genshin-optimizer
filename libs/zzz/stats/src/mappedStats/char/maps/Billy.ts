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
} as const

export default dm

import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'YeShunguang'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackSwiftedge: data_gen.skillParams['basic']['BasicAttackSwiftedge'],
    BasicAttackCloudstreamSwordWill:
      data_gen.skillParams['basic']['BasicAttackCloudstreamSwordWill'],
    BasicAttackEnlightenedMindSplittingCurrents:
      data_gen.skillParams['basic'][
        'BasicAttackEnlightenedMindSplittingCurrents'
      ],
    BasicAttackEnlightenedMindSkywardAscent:
      data_gen.skillParams['basic']['BasicAttackEnlightenedMindSkywardAscent'],
    BasicAttackEnlightenedMindSunderlightMaximum:
      data_gen.skillParams['basic'][
        'BasicAttackEnlightenedMindSunderlightMaximum'
      ],
    BasicAttackEnlightenedMindSunderlight:
      data_gen.skillParams['basic']['BasicAttackEnlightenedMindSunderlight'],
    BasicAttackEnlightenedMindSunderlightAnnihilation:
      data_gen.skillParams['basic'][
        'BasicAttackEnlightenedMindSunderlightAnnihilation'
      ],
    Culmination: data_gen.skillParams['basic']['Culmination'],
  },
  dodge: {
    DodgeLeaveNoTrace: data_gen.skillParams['dodge']['DodgeLeaveNoTrace'],
    DodgeWanderingCloud: data_gen.skillParams['dodge']['DodgeWanderingCloud'],
    DashAttackPhantasmDash:
      data_gen.skillParams['dodge']['DashAttackPhantasmDash'],
    DodgeCounterSwallowStrike:
      data_gen.skillParams['dodge']['DodgeCounterSwallowStrike'],
  },
  special: {
    SpecialAttackGuidingTides:
      data_gen.skillParams['special']['SpecialAttackGuidingTides'],
    EXSpecialAttackGaleSuppression:
      data_gen.skillParams['special']['EXSpecialAttackGaleSuppression'],
    SpecialAttackEnlightenedMindCleanExit:
      data_gen.skillParams['special']['SpecialAttackEnlightenedMindCleanExit'],
    EXSpecialAttackEnlightenedMindSoaringLight:
      data_gen.skillParams['special'][
        'EXSpecialAttackEnlightenedMindSoaringLight'
      ],
    EXSpecialAttackEnlightenedMindReturnToDust:
      data_gen.skillParams['special'][
        'EXSpecialAttackEnlightenedMindReturnToDust'
      ],
  },
  chain: {
    ChainAttackSmiteTheWicked:
      data_gen.skillParams['chain']['ChainAttackSmiteTheWicked'],
    UltimateChasingStorms:
      data_gen.skillParams['chain']['UltimateChasingStorms'],
    ChainAttackEnlightenedMindLureThunder:
      data_gen.skillParams['chain']['ChainAttackEnlightenedMindLureThunder'],
    UltimateCleavingHeavens:
      data_gen.skillParams['chain']['UltimateCleavingHeavens'],
  },
  assist: {
    EntrySkillIlluminatingDarkness:
      data_gen.skillParams['assist']['EntrySkillIlluminatingDarkness'],
    QuickAssistSupportGuard:
      data_gen.skillParams['assist']['QuickAssistSupportGuard'],
    AssistFollowUpCeaseHostility:
      data_gen.skillParams['assist']['AssistFollowUpCeaseHostility'],
    DefensiveAssistWhenIReturn:
      data_gen.skillParams['assist']['DefensiveAssistWhenIReturn'],
    QuickAssistEnlightenedMindTacticalSupport:
      data_gen.skillParams['assist'][
        'QuickAssistEnlightenedMindTacticalSupport'
      ],
    AssistFollowUpEnlightenedMindUnification:
      data_gen.skillParams['assist'][
        'AssistFollowUpEnlightenedMindUnification'
      ],
  },
} as const

export default dm

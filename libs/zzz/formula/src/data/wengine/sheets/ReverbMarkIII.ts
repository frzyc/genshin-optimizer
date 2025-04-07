import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { allBoolConditionals, own, registerBuff, teamBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'ReverbMarkIII'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { chainOrUltUsed } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'atk_',
    teamBuff.combat.atk_.add(
      cmpSpecialtyAndEquipped(
        key,
        chainOrUltUsed.ifOn(subscript(phase, dm.atk_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet

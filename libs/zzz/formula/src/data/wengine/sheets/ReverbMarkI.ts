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

const key: WengineKey = 'ReverbMarkI'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { exSpecialUsed } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    // TODO: teambuff
    'impact_',
    teamBuff.combat.impact_.add(
      cmpSpecialtyAndEquipped(
        key,
        exSpecialUsed.ifOn(subscript(phase, dm.impact_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet

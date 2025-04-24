import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
} from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'MyriadEclipse'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { deathSentence } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),
  registerBuff(
    'crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.crit_dmg_))
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'deathSentence_defIgn_',
    ownBuff.combat.defIgn_.add(
      cmpSpecialtyAndEquipped(
        key,
        deathSentence.ifOn(percent(subscript(phase, dm.defIgn_)))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet

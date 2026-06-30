import { cmpEq, subscript } from '@genshin-optimizer/pando-engine'
import type { WengineKey } from '@genshin-optimizer/zzz-consts'
import { mappedStats } from '@genshin-optimizer/zzz-stats'
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

const key: WengineKey = 'SolExuvia'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { eclipse } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_crit_',
    ownBuff.combat.crit_.add(cmpSpecialtyAndEquipped(key, percent(dm.crit_))),
    showSpecialtyAndEquipped(key)
  ),
  // Conditional buffs
  registerBuff(
    'cond_ether_resIgn_',
    ownBuff.combat.resIgn_.ether.add(
      cmpSpecialtyAndEquipped(
        key,
        cmpEq(
          own.char.key,
          'Pyrois',
          eclipse.ifOn(percent(subscript(phase, dm.ether_resIgn_)))
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet

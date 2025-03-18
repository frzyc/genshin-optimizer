import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { own, ownBuff, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'GildedBlossom'
const dm = mappedStats.wengine[key]
const { modification } = own.wengine

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_atk_',
    ownBuff.combat.atk_.add(
      // TODO: remove the prod when parsing is (maybe) fixed
      cmpSpecialtyAndEquipped(
        key,
        prod(subscript(modification, dm.passive_atk_), 1 / 100)
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'passive_exSpecial_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'exSpecial',
      cmpSpecialtyAndEquipped(
        key,
        subscript(modification, dm.passive_exSpecial_dmg_)
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet

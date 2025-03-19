import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { allNumConditionals, own, registerBuff, teamBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'KaboomTheCannon'
const dm = mappedStats.wengine[key]
const { modification } = own.wengine

const { allyHitsEnemy } = allNumConditionals(key, true, 0, dm.stacks)

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
        prod(allyHitsEnemy, subscript(modification, dm.atk_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet

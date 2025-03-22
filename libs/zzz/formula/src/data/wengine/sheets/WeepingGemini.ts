import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { allNumConditionals, own, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'WeepingGemini'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

// TODO: Add conditionals
const { anomaly_stack } = allNumConditionals(key, true, 0, 4)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'anomaly_stack',
    own.combat.anomProf.add(
      cmpSpecialtyAndEquipped(
        key,
        prod(anomaly_stack, subscript(phase, dm.anomProf))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet

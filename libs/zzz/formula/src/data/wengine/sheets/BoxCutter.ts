import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '@genshin-optimizer/zzz/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'BoxCutter'
const { modification } = own.wengine
const params = getWengineParams(key)

const { launchedAftershock } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'physical_dmg_',
    ownBuff.combat.dmg_.physical.add(
      cmpSpecialtyAndEquipped(
        key,
        launchedAftershock.ifOn(subscript(modification, params[0]))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
  // TODO: add daze_
)
export default sheet

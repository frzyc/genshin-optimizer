import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { customHeal, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'TheBlackSword'
const autoSrc = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const hpRegenSrc = [-1, 0.6, 0.7, 0.8, 0.9, 1]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.normal.add(percent(subscript(refinement, autoSrc))),
  ownBuff.premod.dmg_.charged.add(percent(subscript(refinement, autoSrc))),
  customHeal('heal', prod(subscript(refinement, hpRegenSrc), own.final.atk))
)

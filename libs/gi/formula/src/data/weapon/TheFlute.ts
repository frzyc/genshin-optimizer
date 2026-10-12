import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod } from '@genshin-optimizer/pando/engine'
import { customDmg, own, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'TheFlute'

export default register(
  key,
  entriesForWeapon(key),
  customDmg('dmg_', 'physical', 'elemental', prod(percent(2), own.premod.atk))
)

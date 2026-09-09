import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod } from '@genshin-optimizer/pando/engine'
import { customDmg, own, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SkywardHarp'

export default register(
  key,
  entriesForWeapon(key),
  customDmg('dmg', 'physical', 'elemental', prod(percent(1.25), own.final.atk))
)

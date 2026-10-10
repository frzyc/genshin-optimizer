import { allTravelerKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import { lookup, prod } from '@genshin-optimizer/pando/engine'
import { customDmg, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SwordOfDescension'
const travelerAtk = Object.fromEntries(allTravelerKeys.map((k) => [k, 66]))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk.add(lookup(own.char.charKey, travelerAtk, 0)),
  customDmg('dmg_', 'physical', 'elemental', prod(percent(2), own.premod.atk))
)

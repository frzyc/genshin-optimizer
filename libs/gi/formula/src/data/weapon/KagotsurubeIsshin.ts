import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customDmg,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'KagotsurubeIsshin'
const { passive } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(passive.ifOn(percent(0.15))),
  customDmg('dmg', 'physical', 'elemental', prod(percent(1.8), own.final.atk))
)

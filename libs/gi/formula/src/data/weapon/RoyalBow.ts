import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'RoyalBow'
const critRate_s = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const {
  weapon: { refinement },
} = own
const { Focus } = allNumConditionals(key, true, 0, 5)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.critRate_.add(
    prod(Focus, percent(subscript(refinement, critRate_s)))
  )
)

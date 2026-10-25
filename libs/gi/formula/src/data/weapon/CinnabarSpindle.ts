import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'CinnabarSpindle'
const eleDmgIncSrc = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

const {
  weapon: { refinement },
} = own
const { SpotlessHeart } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.formula.base.skill.add(
    SpotlessHeart.ifOn(
      prod(percent(subscript(refinement, eleDmgIncSrc)), own.premod.def)
    )
  )
)

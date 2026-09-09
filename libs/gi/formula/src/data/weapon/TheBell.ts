import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  customShield,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'TheBell'
const shieldSrc = [-1, 0.2, 0.23, 0.26, 0.29, 0.32]
const allDmgSrc = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const {
  weapon: { refinement },
} = own
const { RebelliousGuardian } = allBoolConditionals(key)
const { WithShield } = allListConditionals(key, ['protected'])

export default register(
  key,
  entriesForWeapon(key),
  customShield(
    'shield',
    undefined,
    RebelliousGuardian.ifOn(
      prod(percent(subscript(refinement, shieldSrc)), own.final.hp)
    )
  ),
  ownBuff.premod.dmg_.add(
    prod(
      WithShield.map({ protected: 1 }),
      percent(subscript(refinement, allDmgSrc))
    )
  )
)

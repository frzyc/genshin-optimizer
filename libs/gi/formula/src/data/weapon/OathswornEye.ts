import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpEq, subscript } from '@genshin-optimizer/pando/engine'
import { allListConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'OathswornEye'
const refinementVals = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]

const {
  weapon: { refinement },
} = own
const { faLight } = allListConditionals(key, ['skillBurst'])

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.enerRech_.add(
    cmpEq(faLight.value, 1, percent(subscript(refinement, refinementVals)))
  )
)

import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'HarbingerOfDawn'
const critRateSrc_ = [-1, 0.14, 0.175, 0.21, 0.245, 0.28]

const {
  weapon: { refinement },
} = own
const { SkyPiercingMight } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.critRate_.add(
    SkyPiercingMight.ifOn(percent(subscript(refinement, critRateSrc_)))
  )
)

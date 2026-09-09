import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customDmg,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SkywardBlade'
const atkSrc_ = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]

const {
  weapon: { refinement },
} = own
const { SkyPiercingMight } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.moveSPD_.add(SkyPiercingMight.ifOn(percent(0.1))),
  ownBuff.premod.atkSPD_.add(SkyPiercingMight.ifOn(percent(0.1))),
  customDmg(
    'dmg',
    'physical',
    'elemental',
    prod(percent(subscript(refinement, atkSrc_)), own.premod.atk),
    { cond: cmpGE(SkyPiercingMight.ifOn(1), 1, 'infer', '') }
  )
)

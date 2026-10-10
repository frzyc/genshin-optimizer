import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { customDmg, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SkywardSpine'
const dmgPerc = [-1, 0.4, 0.55, 0.7, 0.85, 1]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atkSPD_.add(percent(0.12)),
  customDmg(
    'dmg',
    'physical',
    'elemental',
    prod(percent(subscript(refinement, dmgPerc)), own.final.atk)
  )
)

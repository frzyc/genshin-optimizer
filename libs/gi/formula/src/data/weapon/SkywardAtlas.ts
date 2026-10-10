import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { customDmg, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SkywardAtlas'
const dmgBonus = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const dmgPerc = [-1, 1.6, 2, 2.4, 2.8, 3.2]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  allElementKeys.map((ele) =>
    ownBuff.premod.dmg_[ele].add(percent(subscript(refinement, dmgBonus)))
  ),
  customDmg(
    'dmg',
    'physical',
    'elemental',
    prod(percent(subscript(refinement, dmgPerc)), own.final.atk)
  )
)

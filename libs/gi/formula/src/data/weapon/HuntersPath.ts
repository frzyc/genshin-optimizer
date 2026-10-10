import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'HuntersPath'
const allEle_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const charged_dmgIncArr = [-1, 1.6, 2, 2.4, 2.8, 3.2]

const {
  final,
  weapon: { refinement },
} = own
const { passive } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  allElementKeys.map((ele) =>
    ownBuff.premod.dmg_[ele].add(percent(subscript(refinement, allEle_dmg_arr)))
  ),
  ownBuff.formula.base.charged.add(
    passive.ifOn(
      prod(percent(subscript(refinement, charged_dmgIncArr)), final.eleMas)
    )
  )
)

import {
  allLunarReactionKeys,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'NocturnesCurtainCall'
const condHp_arr = [-1, 0.14, 0.16, 0.18, 0.2, 0.22]
const lunarCritDMG_arr = [-1, 0.6, 0.8, 1, 1.2, 1.4]

const {
  weapon: { refinement },
} = own
const { passive } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.hp_.add(
    passive.ifOn(percent(subscript(refinement, condHp_arr)))
  ),
  ...allLunarReactionKeys.map((k) =>
    ownBuff.premod.critDMG_[k].add(
      passive.ifOn(percent(subscript(refinement, lunarCritDMG_arr)))
    )
  )
)

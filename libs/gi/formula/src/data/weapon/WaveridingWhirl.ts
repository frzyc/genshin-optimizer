import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { min, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  register,
  team,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'WaveridingWhirl'
const hpArr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const hpPerTeammateArr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const {
  weapon: { refinement },
} = own
const { passive } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.hp_.add(
    passive.ifOn(
      sum(
        percent(subscript(refinement, hpArr)),
        prod(
          percent(subscript(refinement, hpPerTeammateArr)),
          min(team.common.count.hydro, 2)
        )
      )
    )
  )
)

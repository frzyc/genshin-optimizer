import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { min, prod, subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'RingOfYaxche'
const normal_dmg_arr = [-1, 0.006, 0.007, 0.008, 0.009, 0.01]
const max_normal_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const {
  final,
  weapon: { refinement },
} = own
const { afterSkill } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.normal.add(
    afterSkill.ifOn(
      min(
        prod(
          percent(subscript(refinement, normal_dmg_arr)),
          final.hp,
          1 / 1000
        ),
        percent(subscript(refinement, max_normal_dmg_arr))
      )
    )
  )
)

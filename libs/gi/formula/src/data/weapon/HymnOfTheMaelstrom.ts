import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { max, min, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'HymnOfTheMaelstrom'
const hp_arr = [-1, 0.04, 0.05, 0.06, 0.07, 0.08]
const atk_arr = [-1, 0.004, 0.005, 0.006, 0.007, 0.008]
const maxAtk_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const {
  final,
  weapon: { refinement },
} = own
const { stacks } = allNumConditionals(key, true, 0, 3)
const { frozenSwirl } = allBoolConditionals(key)

const hp_base = prod(stacks, percent(subscript(refinement, hp_arr)))
const atk_base = prod(
  stacks,
  min(
    max(
      prod(
        percent(subscript(refinement, atk_arr)),
        sum(final.hp, -40000),
        1 / 1000
      ),
      0
    ),
    percent(subscript(refinement, maxAtk_arr))
  )
)
const hp_more = frozenSwirl.ifOn(prod(percent(0.75), hp_base))
const atk_more = frozenSwirl.ifOn(prod(percent(0.75), atk_base))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.hp_.add(sum(hp_base, hp_more)),
  teamBuff.premod.atk_.add(sum(atk_base, atk_more))
)

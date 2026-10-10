import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  cmpGE,
  cmpNE,
  min,
  prod,
  subscript,
} from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  own,
  percent,
  register,
  target,
  teamBuff,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'AngelosHeptades'
const dmg_arr = [-1, 0.1, 0.13, 0.16, 0.19, 0.22]
const maxDmg_arr = [-1, 0.26, 0.34, 0.42, 0.5, 0.58]

const {
  weapon: { refinement },
} = own
const { shield } = allBoolConditionals(key)

const dmg_node = min(
  prod(percent(subscript(refinement, dmg_arr)), own.premod.atk, 1 / 1000),
  percent(subscript(refinement, maxDmg_arr))
)

export default register(
  key,
  entriesForWeapon(key),
  teamBuff.premod.dmg_.addOnce(
    'angelos',
    shield.ifOn(dmg_node),
    cmpNE(destIsActive, 0, 1, cmpGE(target.common.hexerei, 1, 0.5))
  )
)

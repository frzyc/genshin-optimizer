import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'TomeOfTheEternalFlow'
const charged_dmg_arr = [-1, 0.14, 0.18, 0.22, 0.26, 0.3]

const {
  weapon: { refinement },
} = own
const { hpChanges } = allNumConditionals(key, true, 0, 3)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.charged.add(
    prod(hpChanges, percent(subscript(refinement, charged_dmg_arr)))
  )
)

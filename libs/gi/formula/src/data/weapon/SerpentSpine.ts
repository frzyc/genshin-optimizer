import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SerpentSpine'
const all_dmg_s = [-1, 0.06, 0.07, 0.08, 0.09, 0.1]

const {
  weapon: { refinement },
} = own
const { Wavesplitter } = allNumConditionals(key, true, 0, 5)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.add(
    prod(Wavesplitter, percent(subscript(refinement, all_dmg_s)))
  )
)

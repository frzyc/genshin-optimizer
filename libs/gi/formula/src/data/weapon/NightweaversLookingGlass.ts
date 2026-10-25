import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  register,
  stackToken,
  teamBuff,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'NightweaversLookingGlass'
const prayerEleMasArr = [-1, 60, 75, 90, 105, 120]
const verseEleMasArr = [-1, 60, 75, 90, 105, 120]
const bloom_dmg_arr = [-1, 1.2, 1.5, 1.8, 2.1, 2.4]
const hb_burgeon_dmg_arr = [-1, 0.8, 1, 1.2, 1.4, 1.6]
const lb_dmg_arr = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

const {
  weapon: { refinement },
} = own
const { afterHydroOrDendro, afterLunarBloom } = allBoolConditionals(key)
const both = afterHydroOrDendro.ifOn(afterLunarBloom.ifOn(1))
const { entries: nightweaverStack, out: nightweaverOut } = stackToken(
  'nightweaver',
  both
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(
    afterHydroOrDendro.ifOn(subscript(refinement, prayerEleMasArr))
  ),
  ownBuff.premod.eleMas.add(
    afterLunarBloom.ifOn(subscript(refinement, verseEleMasArr))
  ),
  nightweaverStack,
  teamBuff.premod.dmg_.bloom.add(
    prod(nightweaverOut, percent(subscript(refinement, bloom_dmg_arr)))
  ),
  teamBuff.premod.dmg_.hyperbloom.add(
    prod(nightweaverOut, percent(subscript(refinement, hb_burgeon_dmg_arr)))
  ),
  teamBuff.premod.dmg_.burgeon.add(
    prod(nightweaverOut, percent(subscript(refinement, hb_burgeon_dmg_arr)))
  ),
  teamBuff.premod.dmg_.lunarbloom.add(
    prod(nightweaverOut, percent(subscript(refinement, lb_dmg_arr)))
  )
)

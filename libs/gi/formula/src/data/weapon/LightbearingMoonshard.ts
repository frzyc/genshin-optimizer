import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'LightbearingMoonshard'
const lunarcrystallize_dmg_arr = [-1, 0.64, 0.8, 0.96, 1.12, 1.28]

const {
  weapon: { refinement },
} = own
const { passive } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.lunarcrystallize.add(
    passive.ifOn(percent(subscript(refinement, lunarcrystallize_dmg_arr)))
  )
)

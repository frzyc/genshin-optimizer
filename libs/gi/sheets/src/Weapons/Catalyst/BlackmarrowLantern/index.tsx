import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  greaterEq,
  input,
  subscript,
  sum,
  tally,
} from '@genshin-optimizer/gi/wr'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'BlackmarrowLantern'

const bloom_dmg_arr = [-1, 0.48, 0.6, 0.72, 0.84, 0.96]
const lunarbloom_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const gleam_lunarbloom_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const bloom_dmg_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, bloom_dmg_arr, { unit: '%' })
)
const lunarbloom_dmg_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, lunarbloom_dmg_arr, { unit: '%' })
)
const gleam_lunarbloom_dmg_ = equal(
  input.weapon.key,
  key,
  greaterEq(
    tally.moonsign,
    2,
    subscript(input.weapon.refinement, gleam_lunarbloom_dmg_arr, { unit: '%' })
  )
)
const totalLunarbloom_dmg_ = sum(lunarbloom_dmg_, gleam_lunarbloom_dmg_)

const data = dataObjForWeaponSheet(key, {
  premod: {
    bloom_dmg_,
    lunarbloom_dmg_: totalLunarbloom_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: bloom_dmg_,
        },
        {
          node: totalLunarbloom_dmg_,
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)

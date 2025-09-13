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

const key: WeaponKey = 'ProspectorsShovel'

const electrocharged_dmg_arr = [-1, 0.48, 0.6, 0.72, 0.84, 0.96]
const lunarcharged_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const gleam_lunarcharged_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const electrocharged_dmg_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, electrocharged_dmg_arr, { unit: '%' })
)
const lunarcharged_dmg_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, lunarcharged_dmg_arr, { unit: '%' })
)
const gleam_lunarcharged_dmg_ = equal(
  input.weapon.key,
  key,
  greaterEq(
    tally.moonsign,
    2,
    subscript(input.weapon.refinement, gleam_lunarcharged_dmg_arr, {
      unit: '%',
    })
  )
)
const totallunarcharged_dmg_ = sum(lunarcharged_dmg_, gleam_lunarcharged_dmg_)

const data = dataObjForWeaponSheet(key, {
  premod: {
    electrocharged_dmg_,
    lunarcharged_dmg_: totallunarcharged_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: electrocharged_dmg_,
        },
        {
          node: totallunarcharged_dmg_,
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)

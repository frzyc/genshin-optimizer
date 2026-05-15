import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  greaterEq,
  input,
  subscript,
  sum,
  tally,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SerenitysCall'

const hp_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const gleam_hp_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const [condAfterReactionPath, condAfterReaction] = cond(key, 'afterReaction')

const hp_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, hp_arr, { unit: '%' })
)
const gleam_hp_ = equal(
  input.weapon.key,
  key,
  greaterEq(
    tally.moonsign,
    2,
    subscript(input.weapon.refinement, gleam_hp_arr, { unit: '%' })
  )
)
const totalHp_ = sum(hp_, gleam_hp_)

const data = dataObjForWeaponSheet(key, {
  premod: {
    hp_: totalHp_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('conditional')),
      path: condAfterReactionPath,
      value: condAfterReaction,
      name: st('afterReaction'),
      states: {
        on: {
          fields: [
            {
              node: totalHp_,
            },
            {
              text: stg('duration'),
              value: 12,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)

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

const key: WeaponKey = 'MasterKey'

const eleMasarr = [-1, 60, 75, 90, 105, 120]
const gleam_eleMasarr = [-1, 60, 75, 90, 105, 120]

const [condAfterReactionPath, condAfterReaction] = cond(key, 'afterReaction')

const eleMas = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, eleMasarr)
)
const gleam_eleMas = equal(
  input.weapon.key,
  key,
  greaterEq(
    tally.moonsign,
    2,
    subscript(input.weapon.refinement, gleam_eleMasarr)
  )
)
const totalEleMas = sum(eleMas, gleam_eleMas)

const data = dataObjForWeaponSheet(key, {
  premod: {
    eleMas: totalEleMas,
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
              node: totalEleMas,
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

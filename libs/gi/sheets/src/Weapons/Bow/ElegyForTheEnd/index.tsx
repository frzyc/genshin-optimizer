import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, equalStr, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'ElegyForTheEnd'
const [, trm] = trans('weapon', key)
const eleMasInc = [-1, 60, 75, 90, 105, 120]
const eleMasInc2 = [-1, 100, 125, 150, 175, 200]
const atk_s = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]

const [condPath, condNode] = cond(key, 'ThePartingRefrain')
const eleMas = subscript(input.weapon.refinement, eleMasInc, { path: 'eleMas' })
const eleMas2 = equal(
  condNode,
  'on',
  subscript(input.weapon.refinement, eleMasInc2, { path: 'eleMas' })
)

const nonstackWrite = equalStr(condNode, 'on', input.charKey)
const [atk_, atk_inactive] = nonStackBuff(
  'millenialatk',
  'atk_',
  subscript(input.weapon.refinement, atk_s)
)

export const data = dataObjForWeaponSheet(key, {
  premod: {
    eleMas,
  },
  teamBuff: {
    premod: {
      atk_,
      eleMas: eleMas2,
    },
    nonStacking: {
      millenialatk: nonstackWrite,
    },
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: eleMas,
        },
      ],
    },
    {
      value: condNode,
      path: condPath,
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      name: trm('condName'),
      states: {
        on: {
          fields: [
            {
              node: eleMas2,
            },
            {
              node: atk_,
            },
            {
              node: atk_inactive,
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

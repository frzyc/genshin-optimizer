import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'Frostbreath'

const atk_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]

const [condreactPath, condReact] = cond(key, 'react')
const react_atk_ = equal(
  'on',
  condReact,
  subscript(input.weapon.refinement, atk_arr)
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_: react_atk_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condReact,
      path: condreactPath,
      header: headerTemplate(key, st('conditional')),
      name: st('elementalReaction.cryoOrHydro'),
      states: {
        on: {
          fields: [
            {
              node: react_atk_,
            },
            {
              text: stg('duration'),
              value: 15,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: 16,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)

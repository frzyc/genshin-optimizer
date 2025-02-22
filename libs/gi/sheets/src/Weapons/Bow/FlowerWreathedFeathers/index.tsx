import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  input,
  lookup,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'FlowerWreathedFeathers'
const charged_dmg_arr = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]

const [condPassivePath, condPassive] = cond(key, 'passive')
const passiveArr = range(1, 6)
const charged_dmg_ = lookup(
  condPassive,
  objKeyMap(passiveArr, (i) =>
    prod(subscript(input.weapon.refinement, charged_dmg_arr, { unit: '%' }), i)
  ),
  naught
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    charged_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: st('stacks'),
      states: objKeyMap(passiveArr, (i) => ({
        name: st('stack', { count: i }),
        fields: [
          {
            node: charged_dmg_,
          },
          {
            text: stg('duration'),
            value: 10,
            unit: 's',
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)

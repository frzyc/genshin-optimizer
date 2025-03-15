import { objKeyMap } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  input,
  lookup,
  naught,
  percent,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'Slingshot'
const [, trm] = trans('weapon', key)

const dmg_arr = [-1, 0.36, 0.42, 0.48, 0.54, 0.6]

const [condPassivePath, condPassive] = cond(key, 'Slingshot')
const condPassiveStates = ['less', 'more']
const normal_dmg_ = lookup(
  condPassive,
  {
    less: subscript(input.weapon.refinement, dmg_arr, { path: 'normal_dmg_' }),
    more: percent(-0.1, { path: 'normal_dmg_' }),
  },
  naught,
)
const charged_dmg_ = { ...normal_dmg_ }

const data = dataObjForWeaponSheet(key, {
  premod: {
    normal_dmg_,
    charged_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: trm('condName'),
      states: objKeyMap(condPassiveStates, (state) => ({
        name: trm(state),
        fields: [
          {
            node: normal_dmg_,
          },
          {
            node: charged_dmg_,
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)

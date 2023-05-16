import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../../Formula'
import { lookup, naught, percent, subscript } from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import { objectKeyMap } from '../../../../Util/Util'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'Slingshot'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const dmg_arr = [0.36, 0.42, 0.48, 0.54, 0.6]

const [condPassivePath, condPassive] = cond(key, 'Slingshot')
const condPassiveStates = ['less', 'more']
const normal_dmg_ = lookup(
  condPassive,
  {
    less: subscript(
      input.weapon.refineIndex,
      dmg_arr,
      KeyMap.info('normal_dmg_')
    ),
    more: percent(-0.1, KeyMap.info('normal_dmg_')),
  },
  naught
)
const charged_dmg_ = { ...normal_dmg_ }

const data = dataObjForWeaponSheet(key, data_gen, {
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
      states: objectKeyMap(condPassiveStates, (state) => ({
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
export default new WeaponSheet(key, sheet, data_gen, data)

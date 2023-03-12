import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript, sum } from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'AmosBow'
const data_gen = data_gen_json as WeaponData
const [, trm] = trans('weapon', key)
const autoDmgInc = [0.12, 0.15, 0.18, 0.21, 0.24]
const arrowDmgInc = [0.08, 0.1, 0.12, 0.14, 0.16]

const [condPassivePath, condPassive] = cond(key, 'StrongWilled')
const normal_dmg_ = subscript(
  input.weapon.refineIndex,
  autoDmgInc,
  KeyMap.info('normal_dmg_')
)
const charged_dmg_ = subscript(
  input.weapon.refineIndex,
  autoDmgInc,
  KeyMap.info('charged_dmg_')
)

const dmgInc = subscript(input.weapon.refineIndex, arrowDmgInc)
const normal_dmg_arrow_ = lookup(
  condPassive,
  {
    ...objectKeyMap(range(1, 5), (i) => prod(dmgInc, i)),
  },
  naught,
  KeyMap.info('normal_dmg_')
)
const charged_dmg_arrow_ = lookup(
  condPassive,
  {
    ...objectKeyMap(range(1, 5), (i) => prod(dmgInc, i)),
  },
  naught,
  KeyMap.info('charged_dmg_')
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    normal_dmg_: sum(normal_dmg_, normal_dmg_arrow_),
    charged_dmg_: sum(charged_dmg_, charged_dmg_arrow_),
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: normal_dmg_,
        },
        {
          node: charged_dmg_,
        },
      ],
    },
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: trm('condName'),
      states: objectKeyMap(range(1, 5), (i) => ({
        name: st('seconds', { count: i / 10 }),
        fields: [
          {
            node: normal_dmg_arrow_,
          },
          {
            node: charged_dmg_arrow_,
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)

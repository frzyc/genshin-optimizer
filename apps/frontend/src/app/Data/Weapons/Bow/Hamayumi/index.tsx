import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, subscript, sum } from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'Hamayumi'
const data_gen = data_gen_json as WeaponData
const [, trm] = trans('weapon', key)

const normal_dmg_s = [0.16, 0.2, 0.24, 0.28, 0.32]
const charged_dmg_s = [0.12, 0.15, 0.18, 0.21, 0.24]

const normal_dmg = subscript(
  input.weapon.refineIndex,
  normal_dmg_s,
  KeyMap.info('normal_dmg_')
)
const charged_dmg = subscript(
  input.weapon.refineIndex,
  charged_dmg_s,
  KeyMap.info('charged_dmg_')
)

const [condPassivePath, condPassive] = cond(key, 'FullDraw')
const normal_passive = equal(
  condPassive,
  'on',
  subscript(input.weapon.refineIndex, normal_dmg_s, KeyMap.info('normal_dmg_'))
)
const charged_passive = equal(
  condPassive,
  'on',
  subscript(
    input.weapon.refineIndex,
    charged_dmg_s,
    KeyMap.info('charged_dmg_')
  )
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    normal_dmg_: sum(normal_dmg, normal_passive),
    charged_dmg_: sum(charged_dmg, charged_passive),
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: normal_dmg,
        },
        {
          node: charged_dmg,
        },
      ],
    },
    {
      value: condPassive,
      path: condPassivePath,
      name: trm('condName'),
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            {
              node: normal_passive,
            },
            {
              node: charged_passive,
            },
          ],
        },
      },
    },
  ],
}

export default new WeaponSheet(key, sheet, data_gen, data)

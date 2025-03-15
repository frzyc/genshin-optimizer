import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  infoMut,
  input,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { customHealNode } from '../../../Characters/dataUtil'
import { st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'TheBlackSword'

const autoSrc = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const hpRegenSrc = [-1, 0.6, 0.7, 0.8, 0.9, 1]
const normal_dmg_ = subscript(input.weapon.refinement, autoSrc)
const charged_dmg_ = subscript(input.weapon.refinement, autoSrc)
const heal = equal(
  input.weapon.key,
  key,
  customHealNode(
    prod(
      subscript(input.weapon.refinement, hpRegenSrc, { unit: '%' }),
      input.total.atk,
    ),
  ),
)

const data = dataObjForWeaponSheet(
  key,
  {
    premod: {
      normal_dmg_,
      charged_dmg_,
    },
  },
  { heal },
)
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
        {
          node: infoMut(heal, { name: stg('healing'), variant: 'heal' }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)

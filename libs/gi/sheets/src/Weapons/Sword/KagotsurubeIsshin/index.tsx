import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  constant,
  equal,
  infoMut,
  input,
  percent,
  prod,
} from '@genshin-optimizer/gi/wr'
import { customDmgNode } from '../../../Characters/dataUtil'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'KagotsurubeIsshin'

const [condPassivePath, condPassive] = cond(key, 'passive')
const atk_ = equal(condPassive, 'on', percent(0.15)) // No refinement data
const dmg = equal(
  input.weapon.key,
  key,
  customDmgNode(prod(percent(1.8), input.total.atk), 'elemental', {
    hit: { ele: constant('physical') },
  }),
)

const data = dataObjForWeaponSheet(
  key,
  {
    premod: {
      atk_,
    },
  },
  {
    dmg,
  },
)

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: infoMut(dmg, { name: st('dmg') }),
        },
      ],
    },
    {
      header: headerTemplate(key, st('conditional')),
      value: condPassive,
      path: condPassivePath,
      name: st('hitOp.normalChargedOrPlunging'),
      states: {
        on: {
          fields: [
            {
              node: atk_,
            },
            {
              text: stg('duration'),
              value: 8,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: 8,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)

import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../../Formula'
import {
  constant,
  equal,
  infoMut,
  percent,
  prod,
  subscript,
} from '../../../../Formula/utils'
import { customDmgNode } from '../../../Characters/dataUtil'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SkywardBlade'
const data_gen = allStats.weapon.data[key]

const [condPassivePath, condPassive] = cond(key, 'SkyPiercingMight')
const atkSrc_ = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const moveSPD_ = equal('on', condPassive, percent(0.1))
const atkSPD_ = equal('on', condPassive, percent(0.1))
const dmg = equal(
  input.weapon.key,
  key,
  equal(
    'on',
    condPassive,
    customDmgNode(
      prod(
        subscript(input.weapon.refinement, atkSrc_, { unit: '%' }),
        input.premod.atk
      ),
      'elemental',
      {
        hit: { ele: constant('physical') },
      }
    )
  )
)
const critRate_arr = data_gen.refinementBonus.critRate_
if (!critRate_arr)
  throw new Error(`data_gen.refinementBonus.critRate_ for ${key} was undefined`)
const critRate_ = subscript(input.weapon.refinement, critRate_arr)

const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    premod: {
      critRate_,
      moveSPD_,
      atkSPD_,
    },
  },
  { dmg }
)
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [{ node: critRate_ }],
    },
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: st('afterUse.burst'),
      states: {
        on: {
          fields: [
            {
              node: moveSPD_,
            },
            {
              node: atkSPD_,
            },
            {
              node: infoMut(dmg, { name: st('dmg') }),
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
export default new WeaponSheet(key, sheet, data_gen, data)

import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, infoMut, prod, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { customHealNode } from '../../../Characters/dataUtil'
import { cond, stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'WhiteIronGreatsword'
const data_gen = data_gen_json as WeaponData

const hpRegen = [0.08, 0.1, 0.12, 0.14, 0.16]
const [condPath, condNode] = cond(key, 'CullTheWeak')
const heal = equal(
  input.weapon.key,
  key,
  equal(
    condNode,
    'on',
    customHealNode(
      prod(
        subscript(input.weapon.refineIndex, hpRegen, { unit: '%' }),
        input.total.hp
      )
    )
  )
)

export const data = dataObjForWeaponSheet(key, data_gen, undefined, { heal })
const sheet: IWeaponSheet = {
  document: [
    {
      value: condNode,
      path: condPath,
      name: st('afterDefeatEnemy'),
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            {
              node: infoMut(heal, { name: stg('healing'), variant: 'heal' }),
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)

import type { WeaponKey } from '@genshin-optimizer/consts'
import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { cond, st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'LionsRoar'
const data_gen = data_gen_json as WeaponData

const [condPassivePath, condPassive] = cond(key, 'BaneOfFireAndThunder')
const dmgInc = [0.2, 0.24, 0.28, 0.32, 0.36]
const all_dmg_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refineIndex, dmgInc)
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: st('enemyAffected.pyroOrElectro'),
      states: {
        on: {
          fields: [
            {
              node: all_dmg_,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)

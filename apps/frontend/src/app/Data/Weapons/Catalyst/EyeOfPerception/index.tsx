import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import {
  constant,
  equal,
  infoMut,
  prod,
  subscript,
} from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'EyeOfPerception'
const data_gen = data_gen_json as WeaponData

const dmg_Src = [2.4, 2.7, 3, 3.3, 3.6]
const dmg = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refineIndex, dmg_Src, { unit: '%' }),
      input.premod.atk
    ),
    'elemental',
    {
      hit: { ele: constant('physical') },
    }
  )
)

const data = dataObjForWeaponSheet(key, data_gen, undefined, {
  dmg_: dmg,
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [{ node: infoMut(dmg, { name: st('dmg') }) }],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)

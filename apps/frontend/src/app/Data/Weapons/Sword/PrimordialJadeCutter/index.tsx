import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, prod, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'PrimordialJadeCutter'
const data_gen = data_gen_json as WeaponData

const hpSrc = [0.2, 0.25, 0.3, 0.35, 0.4]
const atkSrc = [0.012, 0.015, 0.018, 0.021, 0.024]
const hp_ = subscript(input.weapon.refineIndex, hpSrc)
const atk = equal(
  input.weapon.key,
  key,
  prod(
    subscript(input.weapon.refineIndex, atkSrc, { unit: '%' }),
    input.premod.hp
  )
)

const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    premod: {
      hp_,
    },
    total: {
      atk,
    },
  },
  {
    atk,
  }
)

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [{ node: hp_ }, { node: atk }],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)

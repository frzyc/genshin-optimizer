import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../../Formula'
import { equal, prod, subscript } from '../../../../Formula/utils'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'PrimordialJadeCutter'
const data_gen = allStats.weapon.data[key]

const hpSrc = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const atkSrc = [-1, 0.012, 0.015, 0.018, 0.021, 0.024]
const hp_ = subscript(input.weapon.refinement, hpSrc)
const atk = equal(
  input.weapon.key,
  key,
  prod(
    subscript(input.weapon.refinement, atkSrc, { unit: '%' }),
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

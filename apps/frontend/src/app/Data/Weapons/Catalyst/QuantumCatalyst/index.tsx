import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../../Formula'
import {
  equal,
  lookup,
  naught,
  prod,
  subscript,
} from '../../../../Formula/utils'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'QuantumCatalyst'
const data_gen = allStats.weapon.data[key]

const enerRech_arr = [0.18, 0.225, 0.27, 0.315, 0.36]
const normCharged_dmgIncArr = [0.06, 0.075, 0.09, 0.105, 0.12]
const eleMas_arr = [10, 12, 14, 16, 18]
const eleMas_stacks = range(1, 5)

const [condStacksPath, condStacks] = cond(key, 'stacks')

const enerRech_ = subscript(input.weapon.refineIndex, enerRech_arr)
const normal_dmgInc = equal(
  input.weapon.key,
  key,
  prod(
    subscript(input.weapon.refineIndex, normCharged_dmgIncArr, { unit: '%' }),
    input.total.eleMas
  )
)
const charged_dmgInc = { ...normal_dmgInc }
const eleMas = lookup(
  condStacks,
  objectKeyMap(eleMas_stacks, (stack) =>
    prod(subscript(input.weapon.refineIndex, eleMas_arr), stack)
  ),
  naught
)

export const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    premod: {
      enerRech_,
      normal_dmgInc,
      charged_dmgInc,
      eleMas,
    },
  },
  {
    normal_dmgInc,
    charged_dmgInc,
  }
)
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        { node: enerRech_ },
        { node: normal_dmgInc },
        { node: charged_dmgInc },
      ],
    },
    {
      value: condStacks,
      path: condStacksPath,
      teamBuff: true,
      header: headerTemplate(key, st('stacks')),
      name: st('elementalReaction.electro'),
      states: objectKeyMap(eleMas_stacks, (i) => ({
        name: st('stack', { count: i }),
        fields: [
          { node: eleMas },
          { text: stg('duration'), value: 12, unit: 's' },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)

import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  input,
  lookup,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'QuantumCatalyst'

const enerRech_arr = [-1, 0.18, 0.225, 0.27, 0.315, 0.36]
const normCharged_dmgIncArr = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]
const eleMas_arr = [-1, 10, 12, 14, 16, 18]
const eleMas_stacks = range(1, 5)

const [condStacksPath, condStacks] = cond(key, 'stacks')

const enerRech_ = subscript(input.weapon.refinement, enerRech_arr)
const normal_dmgInc = equal(
  input.weapon.key,
  key,
  prod(
    subscript(input.weapon.refinement, normCharged_dmgIncArr, { unit: '%' }),
    input.total.eleMas,
  ),
)
const charged_dmgInc = { ...normal_dmgInc }
const eleMas = lookup(
  condStacks,
  objKeyMap(eleMas_stacks, (stack) =>
    prod(subscript(input.weapon.refinement, eleMas_arr), stack),
  ),
  naught,
)

export const data = dataObjForWeaponSheet(
  key,
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
  },
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
      states: objKeyMap(eleMas_stacks, (i) => ({
        name: st('stack', { count: i }),
        fields: [
          { node: eleMas },
          { text: stg('duration'), value: 12, unit: 's' },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)

import {
  objKeyMap,
  objKeyValMap,
  objMap,
  range,
} from '@genshin-optimizer/common/util'
import { allElementKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equalStr,
  input,
  lookup,
  min,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'PeakPatrolSong'
const [, trm] = trans('weapon', key)

const odeStacksArr = range(1, 2)
const [condOdeStacksPath, condOdeStacks] = cond(key, 'odeStacks')
const def_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const self_ele_dmg_arr = [-1, 0.1, 0.125, 0.15, 0.175, 0.2]
const odeStacks_def_ = lookup(
  condOdeStacks,
  objKeyMap(odeStacksArr, (stack) =>
    prod(subscript(input.weapon.refinement, def_arr, { unit: '%' }), stack)
  ),
  naught
)
const odeStacks_ele_dmg_ = objKeyValMap(allElementKeys, (ele) => [
  `${ele}_dmg_`,
  lookup(
    condOdeStacks,
    objKeyMap(odeStacksArr, (stack) =>
      prod(
        subscript(input.weapon.refinement, self_ele_dmg_arr, { unit: '%' }),
        stack
      )
    ),
    naught
  ),
])

const [condOdeMaxedPath, condOdeMaxed] = cond(key, 'odeMaxed')
const ele_dmg_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const defFactor = prod(min(input.total.def, 3200), 1 / 1000)
const nonstackWrite = equalStr(condOdeMaxed, 'on', input.charKey)
const ele_dmg_ = objKeyValMap(allElementKeys, (key) => [
  `${key}_dmg_`,
  nonStackBuff(
    'patrol',
    `${key}_dmg_`,
    prod(
      defFactor,
      subscript(input.weapon.refinement, ele_dmg_arr, { unit: '%' })
    )
  ),
])

const data = dataObjForWeaponSheet(key, {
  premod: {
    def_: odeStacks_def_,
    ...odeStacks_ele_dmg_,
  },
  teamBuff: {
    premod: objMap(ele_dmg_, (nodes) => nodes[0]), // First node is active node
    nonStacking: {
      patrol: nonstackWrite,
    },
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condOdeStacks,
      path: condOdeStacksPath,
      header: headerTemplate(key, st('stacks')),
      name: trm('odeCond'),
      states: objKeyMap(odeStacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: odeStacks_def_,
          },
          ...Object.values(odeStacks_ele_dmg_).map((node) => ({ node })),
          {
            text: stg('duration'),
            value: 6,
            unit: 's',
          },
        ],
      })),
    },
    {
      value: condOdeMaxed,
      path: condOdeMaxedPath,
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      name: trm('odeMaxedCond'),
      states: {
        on: {
          fields: [
            // Show both active + inactive nodes
            ...Object.values(ele_dmg_).flatMap((nodes) =>
              nodes.map((node) => ({ node }))
            ),
            { text: stg('duration'), value: 15, unit: 's' },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)

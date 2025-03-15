import { objKeyMap } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import {
  equal,
  input,
  lookup,
  naught,
  subscript,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'MistsplitterReforged'
const [, trm] = trans('weapon', key)

const stacks = ['1', '2', '3'] as const
const passiveRefine = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const stacksRefine = {
  '1': [-1, 0.08, 0.1, 0.12, 0.14, 0.16],
  '2': [-1, 0.16, 0.2, 0.24, 0.28, 0.32],
  '3': [-1, 0.28, 0.35, 0.42, 0.49, 0.56],
}
const [condPath, condNode] = cond(key, 'MistsplittersEmblem')
const passive_dmg_ = Object.fromEntries(
  allElementKeys.map((ele) => [
    `${ele}_dmg_`,
    subscript(input.weapon.refinement, passiveRefine, { path: `${ele}_dmg_` }),
  ]),
)
const stacks_dmg_ = Object.fromEntries(
  allElementKeys.map((ele) => [
    `${ele}_dmg_`,
    equal(
      input.charEle,
      ele,
      lookup(
        condNode,
        objKeyMap(stacks, (stack) =>
          subscript(input.weapon.refinement, stacksRefine[stack]),
        ),
        naught,
        { path: `${ele}_dmg_` },
      ),
    ),
  ]),
)
const allEle_dmg_ = Object.fromEntries(
  allElementKeys.map((ele) => [
    `${ele}_dmg_`,
    sum(passive_dmg_[`${ele}_dmg_`], stacks_dmg_[`${ele}_dmg_`]),
  ]),
)

export const data = dataObjForWeaponSheet(key, {
  premod: {
    ...allEle_dmg_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: allElementKeys.map((ele) => ({
        node: passive_dmg_[`${ele}_dmg_`],
      })),
    },
    {
      value: condNode,
      path: condPath,
      name: trm('emblem'),
      teamBuff: true,
      header: headerTemplate(key, st('stacks')),
      states: Object.fromEntries(
        stacks.map((stack) => [
          stack,
          {
            name: st('stack', { count: parseInt(stack) }),
            fields: allElementKeys.map((ele) => ({
              node: stacks_dmg_[`${ele}_dmg_`],
            })),
          },
        ]),
      ),
    },
  ],
}
export default new WeaponSheet(sheet, data)

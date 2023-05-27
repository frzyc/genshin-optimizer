import { input } from '../../../../Formula'
import {
  equal,
  lookup,
  naught,
  subscript,
  sum,
} from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { allElementKeys } from '@genshin-optimizer/consts'
import { objectKeyMap } from '../../../../Util/Util'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'MistsplitterReforged'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const stacks = ['1', '2', '3'] as const
const passiveRefine = [0.12, 0.15, 0.18, 0.21, 0.24]
const stacksRefine = {
  '1': [0.08, 0.1, 0.12, 0.14, 0.16],
  '2': [0.16, 0.2, 0.24, 0.28, 0.32],
  '3': [0.28, 0.35, 0.42, 0.49, 0.56],
}
const [condPath, condNode] = cond(key, 'MistsplittersEmblem')
const passive_dmg_ = Object.fromEntries(
  allElementKeys.map((ele) => [
    `${ele}_dmg_`,
    subscript(
      input.weapon.refineIndex,
      passiveRefine,
      KeyMap.info(`${ele}_dmg_`)
    ),
  ])
)
const stacks_dmg_ = Object.fromEntries(
  allElementKeys.map((ele) => [
    `${ele}_dmg_`,
    equal(
      input.charEle,
      ele,
      lookup(
        condNode,
        objectKeyMap(stacks, (stack) =>
          subscript(input.weapon.refineIndex, stacksRefine[stack])
        ),
        naught,
        KeyMap.info(`${ele}_dmg_`)
      )
    ),
  ])
)
const allEle_dmg_ = Object.fromEntries(
  allElementKeys.map((ele) => [
    `${ele}_dmg_`,
    sum(passive_dmg_[`${ele}_dmg_`], stacks_dmg_[`${ele}_dmg_`]),
  ])
)

export const data = dataObjForWeaponSheet(key, data_gen, {
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
        ])
      ),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)

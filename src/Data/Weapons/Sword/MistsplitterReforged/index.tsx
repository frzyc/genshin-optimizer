import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, lookup, naught, subscript, sum } from "../../../../Formula/utils"
import { allElements, WeaponKey } from '../../../../Types/consts'
import { objectKeyMap } from '../../../../Util/Util'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "MistsplitterReforged"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const stacks = ["1", "2", "3"] as const
const passiveRefine = [0.12, 0.15, 0.18, 0.21, 0.24]
const stacksRefine = {
  "1": [0.08, 0.1, 0.12, 0.14, 0.16],
  "2": [0.16, 0.2, 0.24, 0.28, 0.32],
  "3": [0.28, 0.35, 0.42, 0.49, 0.56]
}
const [condPath, condNode] = cond(key, "MistsplittersEmblem")
const passive_dmg_ = Object.fromEntries(allElements.map(ele =>
  [`${ele}_dmg_`,
  subscript(input.weapon.refineIndex, passiveRefine, { key: `${ele}_dmg_`, variant: ele })]
))
const stacks_dmg_ = Object.fromEntries(allElements.map(ele =>
  [`${ele}_dmg_`,
  equal(input.charEle, ele,
    lookup(condNode, objectKeyMap(stacks, stack =>
      subscript(input.weapon.refineIndex, stacksRefine[stack])), naught, { key: `${ele}_dmg_`, variant: ele })
  )]
))
const allEle_dmg_ = Object.fromEntries(allElements.map(ele =>
  [`${ele}_dmg_`,
  sum(passive_dmg_[`${ele}_dmg_`], stacks_dmg_[`${ele}_dmg_`])]
))

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    ...allEle_dmg_
  },
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: allElements.map(ele => (
      { node: passive_dmg_[`${ele}_dmg_`] }
    ))
  }, {
    value: condNode,
    path: condPath,
    name: trm("emblem"),
    teamBuff: true,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    states: Object.fromEntries(
      stacks.map(stack => [stack, {
        name: st("stack", { count: parseInt(stack) }),
        fields: allElements.map(ele => ({
          node: stacks_dmg_[`${ele}_dmg_`]
        }))
      }])
    )
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)

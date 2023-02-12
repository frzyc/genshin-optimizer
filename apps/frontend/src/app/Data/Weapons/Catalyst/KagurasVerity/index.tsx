import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, subscript, sum } from "../../../../Formula/utils"
import KeyMap from '../../../../KeyMap'
import { allElementKeys, WeaponKey } from '@genshin-optimizer/consts'
import { range } from '../../../../Util/Util'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from "../../WeaponSheet"
import data_gen_json from './data_gen.json'

const key: WeaponKey = "KagurasVerity"
const data_gen = data_gen_json as WeaponData

const [condPath, condNode] = cond(key, "KaguraDance")
const totems = range(1, 3)
const dmg_ = [0.12, 0.15, 0.18, 0.21, 0.24]
const skill_dmg_s = totems.map(i => equal(condNode, i.toString(), subscript(input.weapon.refineIndex, dmg_.map(d => d * i)), KeyMap.info("skill_dmg_")))
const ele_dmg_s = Object.fromEntries(allElementKeys.map(ele => [ele, equal(condNode, "3", subscript(input.weapon.refineIndex, dmg_))]))

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    skill_dmg_: sum(...skill_dmg_s),
    ...Object.fromEntries(allElementKeys.map(ele => [`${ele}_dmg_`, ele_dmg_s[ele]]))
  },
})
const sheet: IWeaponSheet = {
  document: [{
    value: condNode,
    path: condPath,
    header: headerTemplate(key, st("stacks")),
    name: st("afterUse.skill"),
    states:
      Object.fromEntries(totems.map(i => [i, {
        name: st("stack", { count: i }),
        fields: [{
          node: skill_dmg_s[i - 1]
        },
        ...allElementKeys.map(ele => ({ node: ele_dmg_s[ele] }))]
      }]))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)

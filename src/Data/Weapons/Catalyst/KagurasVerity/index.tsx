import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript, sum } from "../../../../Formula/utils"
import { allElements, WeaponKey } from '../../../../Types/consts'
import { range } from '../../../../Util/Util'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "KagurasVerity"
const data_gen = data_gen_json as WeaponData

const [condPath, condNode] = cond(key, "KaguraDance")
const totems = range(1, 3)
const dmg_ = [0.12, 0.15, 0.18, 0.21, 0.24]
const skill_dmg_s = totems.map(i => equal(condNode, i.toString(), subscript(input.weapon.refineIndex, dmg_.map(d => d * i)), { key: "skill_dmg_" }))
const ele_dmg_s = Object.fromEntries(allElements.map(ele => [ele, equal(condNode, "3", subscript(input.weapon.refineIndex, dmg_))]))

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    skill_dmg_: sum(...skill_dmg_s),
    ...Object.fromEntries(allElements.map(ele => [`${ele}_dmg_`, ele_dmg_s[ele]]))
  },
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condNode,
    path: condPath,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    name: st("afterUse.skill"),
    states:
      Object.fromEntries(totems.map(i => [i, {
        name: st("stack", { count: i }),
        fields: [{
          node: skill_dmg_s[i - 1]
        },
        ...allElements.map(ele => ({ node: ele_dmg_s[ele] }))]
      }]))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)

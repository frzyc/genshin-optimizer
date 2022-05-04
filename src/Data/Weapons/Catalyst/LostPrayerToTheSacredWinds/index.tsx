import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, percent, prod, subscript } from "../../../../Formula/utils"
import { allElements, WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "LostPrayerToTheSacredWinds"
const data_gen = data_gen_json as WeaponData
const ele_dmg_s = [0.08, 0.10, 0.12, 0.14, 0.16]

const [condPassivePath, condPassive] = cond(key, "BoundlessBlessing")

const moveSPD_ = percent(0.1)
const eleDmgInc = subscript(input.weapon.refineIndex, ele_dmg_s, { key: "_" })
const eleDmgStacks = Object.fromEntries(allElements.map(ele => [ele, lookup(condPassive, {
  ...objectKeyMap(range(1, 4), i => prod(eleDmgInc, i)),
}, naught)]))

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    moveSPD_,
    ...Object.fromEntries(allElements.map(ele => [`${ele}_dmg_`, eleDmgStacks[ele]])),
  },
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{ node: moveSPD_ }],
  }, {
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    name: st("activeCharField"),
    states: objectKeyMap(range(1, 4), i => ({
      name: st("seconds", { count: i * 4 }),
      fields: allElements.map(ele => ({ node: eleDmgStacks[ele] }))
    }))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)

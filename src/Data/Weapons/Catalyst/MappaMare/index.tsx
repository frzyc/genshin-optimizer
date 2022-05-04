import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { allElements, WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, objectKeyValueMap, range } from '../../../../Util/Util'
import { cond, sgt, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "MappaMare"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const [condPassivePath, condPassive] = cond(key, "InfusionScroll")

const dmgBonus = [0.08, 0.1, 0.12, 0.14, 0.16]
const allDmgInc = subscript(input.weapon.refineIndex, dmgBonus)
const eleDmgs = objectKeyValueMap(allElements, e => [`${e}_dmg_`, lookup(condPassive, {
  ...objectKeyMap(range(1, 2), i => prod(allDmgInc, i))
}, naught)])

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: eleDmgs
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    name: trm("condName"),
    states: objectKeyMap(range(1, 2), i => ({
      name: st("stack", { count: i }),
      fields: [...Object.values(eleDmgs).map(node => ({ node })), {
        text: sgt("duration"),
        value: 10,
        unit: "s"
      }]
    }))
  }]
}
export default new WeaponSheet(key, sheet, data_gen, data)

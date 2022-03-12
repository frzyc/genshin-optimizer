import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, sgt, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionaldesc, conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "MappaMare"
const data_gen = data_gen_json as WeaponData
const [tr, trm] = trans("weapon", key)

const [condPassivePath, condPassive] = cond(key, "InfusionScroll")

const dmgBonus = [0.08, 0.1, 0.12, 0.14, 0.16]
const allDmgInc = subscript(input.weapon.refineIndex, dmgBonus)
const allDmgStacks = lookup(condPassive, {
  ...objectKeyMap(range(1, 2), i => prod(allDmgInc, i))
}, naught)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_: allDmgStacks
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    conditional: {
      value: condPassive,
      path: condPassivePath,
      header: conditionalHeader(tr, icon, iconAwaken),
      description: conditionaldesc(tr),
      name: trm("condName"),
      states: {
        ...objectKeyMap(range(1, 2), i => ({
          name: st("stack", { count: i }),
          fields: [{
            node: allDmgStacks
          }, {
            text: sgt("duration"),
            value: 10,
            unit: "s"
          }]
        }))
      }
    }
  }]
}
export default new WeaponSheet(key, sheet, data_gen, data)

import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { compareEq, constant, lookup, prod, subscript } from "../../../../Formula/utils"
import { allElements, WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "CalamityQueller"
const data_gen = data_gen_json as WeaponData

const [tr] = trans("weapon", key)

const [condStackPath, condStack] = cond(key, "stack")
// const [condActivePath, condActive] = cond(key, "active")

const dmg_ = [0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = [0.032, 0.04, 0.048, 0.056, 0.064]

const dmg_Nodes = Object.fromEntries(allElements.map(e => [`${e}_dmg_`, subscript(input.weapon.refineIndex, dmg_)]))
const atkInc = prod(
  compareEq(input.activeCharKey, input.charKey,
    constant(1, { /* TODO: Add key for active char */ }),
    constant(2, { key: `weapon_${key}:inactiveKey` })),
  lookup(condStack, objectKeyMap(range(1, 6), i => constant(i, { key: "sheet:stacks" })), 0),
  subscript(input.weapon.refineIndex, atk_, { key: '_' }),
)
export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    ...dmg_Nodes,
    atk_: atkInc,
  },
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: Object.values(dmg_Nodes).map(node => ({ node })),
  }, {
    value: condStack,
    path: condStackPath,
    teamBuff: true,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    name: tr("passiveName"),
    states: Object.fromEntries(range(1, 6).map(i => [i, {
      name: st("stack", { count: i }),
      fields: [{ node: atkInc }]
    }]))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)

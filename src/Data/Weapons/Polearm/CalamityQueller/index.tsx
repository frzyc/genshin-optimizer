import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, customStringRead, lookup, match, matchFull, prod, subscript } from "../../../../Formula/utils"
import { allElements, WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "CalamityQueller"
const data_gen = data_gen_json as WeaponData

const condStackPath = [key, "stack"]
const condStack = customStringRead(["conditional", ...condStackPath])

const condActivePath = [key, "active"]
const condActive = customStringRead(["conditional", ...condActivePath])


const dmg_ = [0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = [0.032, 0.04, 0.048, 0.056, 0.064]

const dmg_Nodes = Object.fromEntries(allElements.map(e => [`${e}_dmg_`, subscript(input.weapon.refineIndex, dmg_)]))
const atkInc = prod(
  matchFull(input.activeCharKey, input.charKey, 1, 2), // TODO: Add key for active v inactive
  lookup(condStack, objectKeyMap(range(1, 6), i => constant(i)), 0), // TODO: Add key for stack
  subscript(input.weapon.refineIndex, atk_, { key: '_' }),
)
export const data = dataObjForWeaponSheet(key, data_gen, "heal_", undefined, {
  premod: {
    ...dmg_Nodes,
    // TODO: Check if add to `premod` or `total`
    atk_: atkInc,
  },
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [
      ...Object.values(dmg_Nodes).map(n => ({
        node: n
      })),
    ],
    conditional: {
      value: condStack,
      path: condStackPath,
      name: "Extinguishing Precepty",// TODO: translation
      states: Object.fromEntries(range(1, 6).map(i => [i, {
        name: `Stack ${i}`,
        fields: [{ node: atkInc }]
      }]))
    }
  }, {
    conditional: {
      value: condActive,
      path: condActivePath,
      name: "Not on Field", //TODO: translation
      states: {
        off: {
          fields: [{
            text: "Double Consummation's ATK" //TODO: translation
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)

import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionaldesc, conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "SummitShaper"
const data_gen = data_gen_json as WeaponData
const [tr, trm] = trans("weapon", key)
const shieldSrc = [0.2, 0.25, 0.3, 0.35, 0.40]
const atkSrc = [0.04, 0.05, 0.06, 0.07, 0.08]

// TODO: Doing it this way kind of slows down UI when changing between conditions/hit stacks
// Probably there's a better way to do this, or not idk
const [condPassivePath, condPassive] = cond(key, "GoldenMajesty")
const shield_ = subscript(input.weapon.refineIndex, shieldSrc)

const atkInc = subscript(input.weapon.refineIndex, atkSrc)
const atkStacks = lookup(condPassive, {
  "1": prod(atkInc, 1), "2": prod(atkInc, 2), "3": prod(atkInc, 3),
  "4": prod(atkInc, 4), "5": prod(atkInc, 5), "6": prod(atkInc, 1, 2),
  "7": prod(atkInc, 2, 2), "8": prod(atkInc, 3, 2), "9": prod(atkInc, 4, 2),
  "10": prod(atkInc, 5, 2)
}, naught)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    shield_,
    atk_: atkStacks
  },
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    conditional: {
      value: condPassive,
      path: condPassivePath,
      teamBuff: true,
      header: conditionalHeader(tr, icon, iconAwaken),
      description: conditionaldesc(tr),
      name: trm("condName"),
      states: {
        1: {
          name: "Without Shield: 1 Stack",
          fields: [{
            node: atkStacks
          }, {
            text: sgt("duration"),
            value: 8,
            unit: "s"
          }]
        },
        2: {
          name: "Without Shield: 2 Stacks",
          fields: [{
            node: atkStacks
          }, {
            text: sgt("duration"),
            value: 8,
            unit: "s"
          }]
        },
        3: {
          name: "Without Shield: 3 Stacks",
          fields: [{
            node: atkStacks
          }, {
            text: sgt("duration"),
            value: 8,
            unit: "s"
          }]
        },
        4: {
          name: "Without Shield: 4 Stacks",
          fields: [{
            node: atkStacks
          }, {
            text: sgt("duration"),
            value: 8,
            unit: "s"
          }]
        },
        5: {
          name: "Without Shield: 5 Stacks",
          fields: [{
            node: atkStacks
          }, {
            text: sgt("duration"),
            value: 8,
            unit: "s"
          }]
        },
        6: {
          name: "With Shield: 1 Stacks",
          fields: [{
            node: atkStacks
          }, {
            text: sgt("duration"),
            value: 8,
            unit: "s"
          }]
        },
        7: {
          name: "With Shield: 2 Stacks",
          fields: [{
            node: atkStacks
          }, {
            text: sgt("duration"),
            value: 8,
            unit: "s"
          }]
        },
        8: {
          name: "With Shield: 3 Stacks",
          fields: [{
            node: atkStacks
          }, {
            text: sgt("duration"),
            value: 8,
            unit: "s"
          }]
        },
        9: {
          name: "With Shield: 4 Stacks",
          fields: [{
            node: atkStacks
          }, {
            text: sgt("duration"),
            value: 8,
            unit: "s"
          }]
        },
        10: {
          name: "With Shield: 5 Stacks",
          fields: [{
            node: atkStacks
          }, {
            text: sgt("duration"),
            value: 8,
            unit: "s"
          }]
        },
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)

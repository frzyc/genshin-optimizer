import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, objectKeyValueMap, range } from '../../../../Util/Util'
import { cond, sgt, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionaldesc, conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "VortexVanquisher"
const data_gen = data_gen_json as WeaponData
const [tr, trm] = trans("weapon", key)
const shieldSrc = [0.2, 0.25, 0.3, 0.35, 0.40]
const atkSrc = [0.04, 0.05, 0.06, 0.07, 0.08]

const [condPassivePath, condPassive] = cond(key, "GoldenMajesty")
const shield_ = subscript(input.weapon.refineIndex, shieldSrc)

const atkInc = subscript(input.weapon.refineIndex, atkSrc)
const atkStacks = lookup(condPassive, {
  ...objectKeyMap(range(1, 5), i => prod(atkInc, i)),
  ...objectKeyValueMap(range(1, 5), i => [`w${i}`, prod(atkInc, i, 2)]),
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
        ...objectKeyMap(range(1, 5), i => ({
          name: st("stackWithoutShield", { count: i }),
          fields: [{
            node: atkStacks
          }, {
            text: sgt("duration"),
            value: 8,
            unit: "s"
          }]
        })),
        ...objectKeyValueMap(range(1, 5), i => [`w${i}`, {
          name: st("stackWithShield", { count: i }),
          fields: [{
            node: atkStacks
          }, {
            text: sgt("duration"),
            value: 8,
            unit: "s"
          }]
        }]),
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)

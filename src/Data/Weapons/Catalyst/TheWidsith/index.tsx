import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'
const key: WeaponKey = "TheWidsith"
const data_gen = data_gen_json as WeaponData
const [tr, trm] = trans("weapon", key)

const refinementAtkVals = [0.6, 0.75, 0.9, 1.05, 1.2]
const refinementEleDmgVals = [0.48, 0.6, 0.72, 0.84, 0.96]
const refinementEleMasVals = [240, 300, 360, 420, 480]

const [condPassivePath, condPassive] = cond(key, "Debut")
const atk_ = equal("recitative", condPassive, subscript(input.weapon.refineIndex, refinementAtkVals))
const anemo_dmg_ = equal("aria", condPassive, subscript(input.weapon.refineIndex, refinementEleDmgVals))
const cryo_dmg_ = equal("aria", condPassive, subscript(input.weapon.refineIndex, refinementEleDmgVals))
const electro_dmg_ = equal("aria", condPassive, subscript(input.weapon.refineIndex, refinementEleDmgVals))
const geo_dmg_ = equal("aria", condPassive, subscript(input.weapon.refineIndex, refinementEleDmgVals))
const hydro_dmg_ = equal("aria", condPassive, subscript(input.weapon.refineIndex, refinementEleDmgVals))
const pyro_dmg_ = equal("aria", condPassive, subscript(input.weapon.refineIndex, refinementEleDmgVals))
const eleMas = equal("interlude", condPassive, subscript(input.weapon.refineIndex, refinementEleMasVals))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    anemo_dmg_,
    cryo_dmg_,
    electro_dmg_,
    geo_dmg_,
    hydro_dmg_,
    pyro_dmg_,
    eleMas
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    teamBuff: true,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: tr("passiveName"),
    states: {
      aria: {
        name: trm("aria"),
        fields: [{
          node: anemo_dmg_
        }, {
          node: cryo_dmg_
        }, {
          node: electro_dmg_
        }, {
          node: geo_dmg_
        }, {
          node: hydro_dmg_
        }, {
          node: pyro_dmg_
        }, {
          text: sgt("duration"),
          value: 10,
          unit: "s"
        }]
      },
      interlude: {
        name: trm("interlude"),
        fields: [{
          node: eleMas
        }, {
          text: sgt("duration"),
          value: 10,
          unit: "s"
        }]
      },
      recitative: {
        name: trm("recitative"),
        fields: [{
          node: atk_
        }, {
          text: sgt("duration"),
          value: 10,
          unit: "s"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)

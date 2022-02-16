import { WeaponData } from 'pipeline'
import ImgIcon from '../../../../Components/Image/ImgIcon'
import { Translate } from '../../../../Components/Translate'
import { input } from '../../../../Formula'
import { match, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { sgt } from '../../../Characters/SheetUtil'
import { cond, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'
const key: WeaponKey = "TheWidsith"
const data_gen = data_gen_json as WeaponData
const [tr] = trans("weapon", key)

const refinementAtkVals = [0.6, 0.75, 0.9, 1.05, 1.2]
const refinementEleDmgVals = [0.48, 0.6, 0.72, 0.84, 0.96]
const refinementEleMasVals = [240, 300, 360, 420, 480]

const [condPassivePath, condPassive] = cond(key, "Debut")
const atk_ = match("recitative", condPassive, subscript(input.weapon.refineIndex, refinementAtkVals))
const anemo_dmg_ = match("aria", condPassive, subscript(input.weapon.refineIndex, refinementEleDmgVals))
const cryo_dmg_ = match("aria", condPassive, subscript(input.weapon.refineIndex, refinementEleDmgVals))
const electro_dmg_ = match("aria", condPassive, subscript(input.weapon.refineIndex, refinementEleDmgVals))
const geo_dmg_ = match("aria", condPassive, subscript(input.weapon.refineIndex, refinementEleDmgVals))
const hydro_dmg_ = match("aria", condPassive, subscript(input.weapon.refineIndex, refinementEleDmgVals))
const pyro_dmg_ = match("aria", condPassive, subscript(input.weapon.refineIndex, refinementEleDmgVals))
const eleMas = match("interlude", condPassive, subscript(input.weapon.refineIndex, refinementEleMasVals))

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
    conditional: {
      value: condPassive,
      path: condPassivePath,
      teamBuff: true,
      header: {
        title: tr(`passiveName`),
        icon: data => <ImgIcon size={2} sx={{ m: -1 }} src={data.get(input.weapon.asc).value < 2 ? icon : iconAwaken} />,
      },
      description: data => tr(`passiveDescription.${data.get(input.weapon.refineIndex).value}`),
      name: <Translate ns="weapon_TheWidsith_gen" key18="passiveName" />,
      states: {
        aria: {
          name: "Aria",
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
          name: "Interlude",
          fields: [{
            node: eleMas
          }, {
            text: sgt("duration"),
            value: 10,
            unit: "s"
          }]
        },
        recitative: {
          name: "Recitative",
          fields: [{
            node: atk_
          }, {
            text: sgt("duration"),
            value: 10,
            unit: "s"
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
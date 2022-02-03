import { WeaponData } from 'pipeline'
import { Translate } from '../../../../Components/Translate'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import ImgIcon from '../../../../Components/Image/ImgIcon'
import { sgt } from '../../../Characters/SheetUtil'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import { input } from '../../../../Formula'
import { WeaponKey } from '../../../../Types/consts'
import { customStringRead, infoMut, match, subscript } from '../../../../Formula/utils'
import { dataObjForWeaponSheet } from '../../util'
const key: WeaponKey = "FreedomSworn"
const data_gen = data_gen_json as WeaponData
const tr = (strKey: string) => <Translate ns={`weapon_${key}_gen`} key18={strKey} />
const autoSrc = [0.16, 0.20, 0.24, 0.28, 0.32]
const atk_Src = [0.2, 0.25, 0.3, 0.35, 0.40]

const condPath = [key, "MillennialMovement"]
const cond = customStringRead(["conditional", ...condPath])
const atk_ = match("on", cond, subscript(input.weapon.refineIndex, atk_Src))
const normal = match("on", cond, subscript(input.weapon.refineIndex, autoSrc))
const charged = match("on", cond, subscript(input.weapon.refineIndex, autoSrc))
const plunging = match("on", cond, subscript(input.weapon.refineIndex, autoSrc))

const data = dataObjForWeaponSheet(key, data_gen, "dmg_", undefined, {
  premod: {
    atk_,
    dmgBonus: {
      normal,
      charged,
      plunging,
    }
  }
})

const sheet: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      value: cond,
      path: condPath,
      header: {
        title: tr(`passiveName`),
        icon: data => <ImgIcon size={2} sx={{ m: -1 }} src={data.get(input.weapon.asc).value < 2 ? icon : iconAwaken} />,
      },
      description: data => tr(`passiveDescription.${data.get(input.weapon.refineIndex).value}`),
      name: <Translate ns="weapon_FreedomSworn" key18="name" />,
      states: {
        on: {
          fields: [{
            node: infoMut(atk_, { key: "atk_" })
          }, {
            node: infoMut(normal, { key: "normal_dmg_" })
          }, {
            node: infoMut(charged, { key: "charged_dmg_" })
          }, {
            node: infoMut(plunging, { key: "plunging_dmg_" })
          }, {
            text: sgt("duration"),
            value: 12,
            unit: "s"
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data)

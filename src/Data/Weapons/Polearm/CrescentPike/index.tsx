import { WeaponData } from 'pipeline'
import ImgIcon from '../../../../Components/Image/ImgIcon'
import { input } from '../../../../Formula'
import { WeaponKey } from '../../../../Types/consts'
import { cond, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "CrescentPike"
const data_gen = data_gen_json as WeaponData
const [tr] = trans("weapon", key)

// Additional DMG from passive does not get added into formula because its not accounted for in building, etc.
const atkInc = [0.2, 0.25, 0.3, 0.35, 0.4]
const [condPassivePath, condPassive] = cond(key, "InfusionNeedle")
const data = dataObjForWeaponSheet(key, data_gen, undefined)

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    conditional: {
      value: condPassive,
      path: condPassivePath,
      header: {
        title: tr(`passiveName`),
        icon: data => <ImgIcon size={2} sx={{ m: -1 }} src={data.get(input.weapon.asc).value < 2 ? icon : iconAwaken} />,
      },
      description: data => tr(`passiveDescription.${data.get(input.weapon.refineIndex).value}`),
      name: "Picked up an Elemental Orb/Particle",
      states: {
        on: {
          fields: [{
            // TODO: Probably needs translation for this
            text: "Normal and Charged Attacks deal additional DMG",
            // TODO: Is it input.total.atk or is it input.premod.atk?
            // .toFixed(2) because it goes beyond 2 decimal places
            value: data => `${(atkInc[data.get(input.weapon.refineIndex).value] * data.get(input.total.atk).value).toFixed(2)}`,
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
import { WeaponData } from 'pipeline'
import ImgIcon from '../../../../Components/Image/ImgIcon'
import { Translate } from '../../../../Components/Translate'
import { input } from '../../../../Formula'
import { constant, lookup, match, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap } from '../../../../Util/Util'
import { cond, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'
const key: WeaponKey = "BlackTassel"
const data_gen = data_gen_json as WeaponData
const [tr] = trans("weapon", key)
export const st = (strKey: string) => <Translate ns="sheet" key18={strKey} />
export const sgt = (strKey: string) => <Translate ns="sheet_gen" key18={strKey} />

const dmgInc = [0.4, 0.5, 0.6, 0.7, 0.8]
const [condPassivePath, condPassive] = cond(key, "PressTheAdvantage")
const all_dmg_ = match("on", condPassive, subscript(input.weapon.refineIndex, dmgInc))
// TODO: Is it truly premod: all_dmg_? Or is it something else
const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_
  }
})

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
      name: "Against Slimes",
      states: {
        on: {
          fields: [{
            node: all_dmg_,
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
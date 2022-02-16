import { WeaponData } from 'pipeline'
import ImgIcon from '../../../../Components/Image/ImgIcon'
import { Translate } from '../../../../Components/Translate'
import { input } from '../../../../Formula'
import { constant, lookup, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap } from '../../../../Util/Util'
import { cond, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'
const key: WeaponKey = "BlackcliffPole"
const data_gen = data_gen_json as WeaponData
const [tr] = trans("weapon", key)
export const st = (strKey: string) => <Translate ns="sheet" key18={strKey} />
export const sgt = (strKey: string) => <Translate ns="sheet_gen" key18={strKey} />

const [condPassivePath, condPassive] = cond(key, "PressTheAdvantage")
const opponentsDefeated = [1, 2, 3]
const atkInc = [0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = prod(lookup(condPassive, objectKeyMap(opponentsDefeated, i => constant(i)), 0),
  subscript(input.weapon.refineIndex, atkInc))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_: atk_
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
      name: st("afterDefeatEnemy"),
      states:
        Object.fromEntries(opponentsDefeated.map(c => [c, {
          name: `${c}`,
          fields: [{
            node: atk_,
          }, {
            text: sgt("duration"),
            value: 30,
            unit: "s"
          }]
        }]))
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
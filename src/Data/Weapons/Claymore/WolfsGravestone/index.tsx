import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "WolfsGravestone"
const data_gen = data_gen_json as WeaponData

const atk_Src = [0.2, 0.25, 0.3, 0.35, 0.4]
const atkTeam_Src = [0.4, 0.5, 0.6, 0.7, 0.8]
const [condPassivePath, condPassive] = cond(key, "WolfishTracker")
const atk_ = subscript(input.weapon.refineIndex, atk_Src)
const atkTeam_ = equal("on", condPassive, subscript(input.weapon.refineIndex, atkTeam_Src, { key: "atk_" }))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_: atk_,
  },
  teamBuff: {
    premod: {
      atk_: atkTeam_,
    }
  }
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{ node: atk_ }],
  }, {
    value: condPassive,
    path: condPassivePath,
    teamBuff: true,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: st("enemyLessPercentHP", { percent: 30 }),
    states: {
      on: {
        fields: [{
          node: atkTeam_
        }, {
          text: sgt("duration"),
          value: 12,
          unit: "s"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)

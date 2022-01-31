import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import { sgt, st } from '../../../Characters/SheetUtil'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => {
    if (stats.characterKey === "Aloy") return {
      atk: 66
    }
    return undefined
  },
  document: [{
    conditional: {
      key: "ss",
      name: st("hitOp.cryo"),
      maxStack: 2,
      stats: {
        normal_dmg_: 10,
        charged_dmg_: 10,
      },
      fields: [{
        text: sgt("duration"),
        value: 6,
        unit: "s"
      }]
    }
  }],
}
export default weapon
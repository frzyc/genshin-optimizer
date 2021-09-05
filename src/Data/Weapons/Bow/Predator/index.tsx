import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import { sgt, st } from '../../../Characters/SheetUtil'
import data_gen from './data_gen.json'
import img from './Weapon_Predator.png'

const conditionals: IConditionals = {
  ss: {
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
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => {
    if (stats.characterKey === "aloy") return {
      atk: 66
    }
    return undefined
  },
  conditionals,
  document: [{
    conditional: conditionals.ss
  }],
}
export default weapon
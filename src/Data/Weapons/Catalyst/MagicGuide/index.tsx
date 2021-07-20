import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Magic_Guide.png'

const dmg_s = [12, 15, 18, 21, 24]
const conditionals: IConditionals = {
  bst: {
    name: "Against Opponents Accefted by Hydro/Electro",
    maxStack: 1,
    stats: stats => ({
      dmg_: dmg_s[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.bst
  }],
}
export default weapon
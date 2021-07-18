import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_The_Alley_Flash.png'

const refinementVals = [12, 15, 18, 21, 24]
const conditionals: IConditionals = {
  ih: {
    name: "Not Taking DMG",
    maxStack: 1,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.ih
  }]
}
export default weapon
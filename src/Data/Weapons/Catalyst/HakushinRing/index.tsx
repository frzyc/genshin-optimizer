import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Hakushin_Ring.png'

const refinementVals = [10, 12.5, 15, 17.5, 20]
const conditionals: IConditionals = {
  r: {
    name: "After Electro Elemental Reaction",
    stats: stats => ({
      [`${stats.characterEle}_dmg_`]: refinementVals[stats.weapon.refineIndex]
    })
  }
}//TODO: party elemental bonus
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.r
  }],
}
export default weapon
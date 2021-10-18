import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const refinementVals = [6, 7.5, 9, 10.5, 12]
const conditionals: IConditionals = {
  is: {
    name: "Elemental Hits",
    maxStack: 2,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  conditionals,
  document: [{
    conditional: conditionals.is
  }],
}
export default weapon
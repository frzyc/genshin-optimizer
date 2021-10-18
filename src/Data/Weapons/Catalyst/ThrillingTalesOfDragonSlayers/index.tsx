import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

// const refinementVals = [24, 30, 36, 42, 48]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,  //TODO: show this up as a conditional when in the party
  document: []
  // conditional: {
  //   type: "weapon",
  //   sourceKey: "ThrillingTalesOfDragonSlayers",
  //   maxStack: 1,
  //   stats: stats => ({
  //     atk_: refinementVals[stats.weapon.refineIndex]
  //   })
  // }
}
export default weapon
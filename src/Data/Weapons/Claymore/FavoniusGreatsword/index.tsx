import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

// const refinementVals = [60, 70, 80, 90, 100]
// const refinementCdVals = [12, 10.5, 9, 7.5, 6]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: []
}
export default weapon
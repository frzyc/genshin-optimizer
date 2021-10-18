import { IWeaponSheet } from '../../../../Types/weapon'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

import data_gen from './data_gen.json'
import { WeaponData } from 'pipeline'
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [],
}
export default weapon
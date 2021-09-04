import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_The_Catch.png'

const burst_ = [16, 20, 24, 28, 32]
const burstCR_ = [6, 7.5, 9, 10.5, 12]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    burst_dmg_: burst_[stats.weapon.refineIndex],
    burst_critRate_: burstCR_[stats.weapon.refineIndex]
  }),
  document: []
}
export default weapon
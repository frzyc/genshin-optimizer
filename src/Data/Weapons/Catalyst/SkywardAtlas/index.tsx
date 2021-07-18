import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Skyward_Atlas.png'

const refinementVals = [12, 15, 18, 21, 24]
const refinementDmgVals = [160, 200, 240, 280, 320]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    anemo_dmg_: refinementVals[stats.weapon.refineIndex],
    geo_dmg_: refinementVals[stats.weapon.refineIndex],
    electro_dmg_: refinementVals[stats.weapon.refineIndex],
    hydro_dmg_: refinementVals[stats.weapon.refineIndex],
    pyro_dmg_: refinementVals[stats.weapon.refineIndex],
    cryo_dmg_: refinementVals[stats.weapon.refineIndex],
  })
}
export default weapon
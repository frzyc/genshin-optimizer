import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const refinementVals = [8, 10, 12, 14, 16]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: () => ({
    moveSPD_: 10
  }),
  document: [{
    conditional: {
      key: "bb",
      name: "Duration on Field (4s / stack)",
      maxStack: 4,
      stats: stats => ({
        anemo_dmg_: refinementVals[stats.weapon.refineIndex],
        geo_dmg_: refinementVals[stats.weapon.refineIndex],
        electro_dmg_: refinementVals[stats.weapon.refineIndex],
        hydro_dmg_: refinementVals[stats.weapon.refineIndex],
        pyro_dmg_: refinementVals[stats.weapon.refineIndex],
        cryo_dmg_: refinementVals[stats.weapon.refineIndex],
      })
    }
  }],
}
export default weapon
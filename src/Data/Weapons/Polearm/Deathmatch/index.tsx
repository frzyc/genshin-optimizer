import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import { Translate } from '../../../../Components/Translate'
const tr = (strKey: string) => <Translate ns="weapon_Deathmatch_gen" key18={strKey} />
const refinementVals = [16, 20, 24, 28, 32]
const refinementSoloVals = [24, 30, 36, 42, 48]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "g",
      name: tr(`passiveName`),
      states: {
        o2: {
          name: "At least 2 opponents",
          stats: stats => ({
            atk_: refinementVals[stats.weapon.refineIndex],
            def_: refinementVals[stats.weapon.refineIndex]
          })
        },
        o1: {
          name: "Less than 2 opponents",
          stats: stats => ({
            atk_: refinementSoloVals[stats.weapon.refineIndex]
          })
        }
      }
    }
  }],
}
export default weapon
import { WeaponData } from 'pipeline'
import { allElements } from '../../../../Types/consts'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import { Translate } from '../../../../Components/Translate'
const tr = (strKey: string) => <Translate ns="weapon_TheWidsith_gen" key18={strKey} />
const refinementAtkVals = [60, 75, 90, 105, 120]
const refinementEleDmgVals = [48, 60, 72, 84, 96]
const refinementEleMasVals = [240, 300, 360, 420, 480]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "d",
      name: tr(`passiveName`),
      states: {
        r: {
          name: "Recitative",
          stats: stats => ({
            atk_: refinementAtkVals[stats.weapon.refineIndex]
          })
        },
        a: {
          name: "Aria",
          maxStack: 1,
          stats: stats => Object.fromEntries(allElements.map(ele => [`${ele}_dmg_`, refinementEleDmgVals[stats.weapon.refineIndex]]))
        },
        i: {
          name: "Interlude",
          stats: stats => ({
            eleMas: refinementEleMasVals[stats.weapon.refineIndex]
          })
        }
      }
    }
  }],
}
export default weapon
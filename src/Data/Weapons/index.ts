import claymore from './Claymore'
import sword from './Sword'
import polearm from './Polearm'
import bow from './Bow'
import catalyst from './Catalyst'
import { IWeaponSheets } from '../../Types/weapon'
import { documentProcessing } from '../../Util/DocumentUtil'

const WeaponData: IWeaponSheets = {
  ...sword,
  ...claymore,
  ...polearm,
  ...bow,
  ...catalyst
}
Object.values(WeaponData).forEach(weapon => weapon.document && documentProcessing(weapon.document))
export default WeaponData
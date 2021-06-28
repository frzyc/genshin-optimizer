import { allWeaponKeys, WeaponKey } from '../Types/consts';
import ICalculatedStats from '../Types/ICalculatedStats';
import { IWeaponSheet } from '../Types/weapon';
import { evalIfFunc } from '../Util/Util';

export const weaponImport = import('../Data/Weapons').then(imp =>
  Object.fromEntries(Object.entries(imp.default).map(([charKey, value]) =>
    [charKey, new WeaponSheet(value)])) as unknown as StrictDict<WeaponKey, WeaponSheet>)

const loadWeaponSheet = Object.fromEntries(allWeaponKeys.map(set =>
  [set, weaponImport.then(sheets => sheets[set])])) as StrictDict<WeaponKey, Promise<WeaponSheet>>

export default class WeaponSheet {
  sheet: IWeaponSheet;
  constructor(weaponSheet: IWeaponSheet) { this.sheet = weaponSheet }
  static get = (weaponKey: WeaponKey | string): Promise<WeaponSheet> | undefined => weaponKey ? loadWeaponSheet[weaponKey] : undefined
  static getAll = (): Promise<StrictDict<WeaponKey, WeaponSheet>> => weaponImport
  static getWeaponsOfType = (sheets: StrictDict<WeaponKey, WeaponSheet>, weaponType: string): Dict<WeaponKey, WeaponSheet> => Object.fromEntries(Object.entries(sheets).filter(([key, sheet]) => (sheet as WeaponSheet).weaponType === weaponType))
  get name() { return this.sheet.name }
  get weaponType() { return this.sheet.weaponType }
  get img() { return this.sheet.img }
  get rarity() { return this.sheet.rarity }
  get passiveName() { return this.sheet.passiveName }
  passiveDescription(stats: ICalculatedStats) {
    const desc = this.sheet.passiveDescription
    return evalIfFunc(desc, stats)
  }
  get description() { return this.sheet.description }
  get baseStats() { return this.sheet.baseStats }
  stats = (build: ICalculatedStats): object | undefined => evalIfFunc(this.sheet.stats, build) || {}
  get conditionals() { return this.sheet.conditionals }
  get document() { return this.sheet.document }
}

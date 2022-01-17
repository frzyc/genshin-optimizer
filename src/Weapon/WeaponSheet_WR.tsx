import { Translate } from '../Components/Translate';
import { ascensionMaxLevel } from '../Data/LevelData';
import { Data } from '../Formula/type';
import { WeaponKey } from '../Types/consts';
import { ICachedWeapon, IWeaponSheet } from '../Types/weapon_WR';
import { objectMap } from '../Util/Util';

export const weaponImport = import('../Data/Weapons/index_WR')

const weaponSheets = weaponImport.then(imp => objectMap(imp.default, (weapon, key) => new WeaponSheet(key, weapon.default, weapon.data))) as Promise<Record<WeaponKey, WeaponSheet>>

export default class WeaponSheet {
  readonly key: WeaponKey;
  readonly sheet: IWeaponSheet;
  readonly data: Data;
  constructor(key: string, weaponSheet: IWeaponSheet, data: Data) {
    this.key = key as WeaponKey
    this.sheet = weaponSheet
    this.data = data
  }
  static get = (weaponKey: WeaponKey | ""): Promise<WeaponSheet> | undefined => weaponKey ? weaponSheets.then(w => w[weaponKey]) : undefined
  static get getAll() { return weaponSheets }
  static getWeaponsOfType = (sheets: StrictDict<WeaponKey, WeaponSheet>, weaponType: string): Dict<WeaponKey, WeaponSheet> => Object.fromEntries(Object.entries(sheets).filter(([key, sheet]) => (sheet as WeaponSheet).weaponType === weaponType))
  static getLevelString = (weapon: ICachedWeapon): string => `${weapon.level}/${ascensionMaxLevel[weapon.ascension]}`
  tr = (strKey: string) => <Translate ns={`weapon_${this.key}_gen`} key18={strKey} />
  get name() { return this.tr("name") }
  //when there is no substat, assume there is no passive. 
  get passiveName() { return this.rarity > 2 ? this.tr("passiveName") : "" }
  get description() { return this.tr("description") }
  passiveDescription = (refineIndex: number) => this.rarity > 2 ? this.tr(`passiveDescription.${refineIndex}`) : ""
  get weaponType() { return this.sheet.weaponType }
  get img() { return this.sheet.icon }
  get imgAwaken() { return this.sheet.iconAwaken }
  get rarity() { return this.sheet.rarity }
  get document() { return this.sheet.document }
}

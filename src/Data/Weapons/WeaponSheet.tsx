import { Translate } from '../../Components/Translate';
import { Data } from '../../Formula/type';
import { Rarity, WeaponKey, WeaponTypeKey } from '../../Types/consts';
import { DocumentSection } from '../../Types/sheet';
import { ICachedWeapon } from '../../Types/weapon_WR';
import { ascensionMaxLevel } from '../LevelData';
import type { WeaponData } from 'pipeline';
const weaponSheets = import('.').then(imp => imp.default)

export interface IWeaponSheet {
  icon: string,
  iconAwaken: string,
  document: DocumentSection[],
}

export default class WeaponSheet {
  readonly key: WeaponKey;
  readonly sheet: IWeaponSheet;
  readonly data: Data;
  readonly rarity: Rarity;
  readonly weaponType: WeaponTypeKey;
  constructor(key: string, weaponSheet: IWeaponSheet, weaponData: WeaponData, data: Data) {
    this.rarity = weaponData.rarity
    this.weaponType = weaponData.weaponType
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
  get img() { return this.sheet.icon }
  get imgAwaken() { return this.sheet.iconAwaken }
  get document() { return this.sheet.document }
}

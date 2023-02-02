import { Rarity, WeaponKey, WeaponTypeKey } from '@genshin-optimizer/consts';
import { weaponAsset } from '@genshin-optimizer/g-assets';
import type { WeaponData } from '@genshin-optimizer/pipeline';
import { displayDataMap } from ".";
import ImgIcon from '../../Components/Image/ImgIcon';
import SqBadge from '../../Components/SqBadge';
import { Translate } from '../../Components/Translate';
import { input } from '../../Formula';
import { Data } from '../../Formula/type';
import { IDocumentHeader } from '../../Types/sheet';
import { ICachedWeapon } from '../../Types/weapon';
import { getLevelString } from '../LevelData';
import { IWeaponSheet } from './IWeaponSheet';
export default class WeaponSheet {
  readonly key: WeaponKey;
  readonly sheet: IWeaponSheet;
  readonly data: Data;
  readonly rarity: Rarity;
  readonly weaponType: WeaponTypeKey;
  constructor(key: WeaponKey, weaponSheet: IWeaponSheet, weaponData: WeaponData, data: Data) {
    this.rarity = weaponData.rarity
    this.weaponType = weaponData.weaponType
    this.key = key
    this.sheet = weaponSheet
    this.data = data
  }
  static trm(key: string) { return (strKey: string) => <Translate ns={`weapon_${key}`} key18={strKey} /> }
  static tr(key: string) { return (strKey: string) => <Translate ns={`weapon_${key}_gen`} key18={strKey} /> }
  static getAllDataOfType(weaponType: WeaponTypeKey) { return displayDataMap[weaponType] }
  static getWeaponsOfType = (sheets: StrictDict<WeaponKey, WeaponSheet>, weaponType: string): Dict<WeaponKey, WeaponSheet> => Object.fromEntries(Object.entries(sheets).filter(([_, sheet]) => (sheet as WeaponSheet).weaponType === weaponType))
  static getLevelString = (weapon: ICachedWeapon) => getLevelString(weapon.level, weapon.ascension)
  get tr() { return WeaponSheet.tr(this.key) }
  get name() { return this.tr("name") }
  get hasRefinement() { return this.rarity > 2 }
  get passiveName() { return this.hasRefinement ? this.tr("passiveName") : "" }
  get description() { return this.tr("description") }
  passiveDescription = (refineIndex: number) => this.hasRefinement ? this.tr(`passiveDescription.${refineIndex}`) : ""
  get document() { return this.sheet.document }
}
export function headerTemplate(weaponKey: WeaponKey, action?: Displayable): IDocumentHeader {
  const tr = (strKey: string) => <Translate ns={`weapon_${weaponKey}_gen`} key18={strKey} />
  return {
    title: tr(`passiveName`),
    icon: data => <ImgIcon size={2} src={weaponAsset(weaponKey, data.get(input.weapon.asc).value >= 2)} />,
    action: action && <SqBadge color="success">{action}</SqBadge>,
    description: data => tr(`passiveDescription.${data.get(input.weapon.refineIndex).value}`)
  }
}

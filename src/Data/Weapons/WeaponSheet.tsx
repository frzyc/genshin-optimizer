import type { WeaponData } from 'pipeline';
import ImgIcon from '../../Components/Image/ImgIcon';
import SqBadge from '../../Components/SqBadge';
import { Translate } from '../../Components/Translate';
import { input } from '../../Formula';
import { mergeData } from '../../Formula/api';
import { Data } from '../../Formula/type';
import { allWeaponTypeKeys, Rarity, WeaponKey, WeaponTypeKey } from '../../Types/consts';
import { DocumentSection, IDocumentHeader } from '../../Types/sheet';
import { ICachedWeapon } from '../../Types/weapon';
import { getLevelString } from '../LevelData';

const weaponSheets = import('.').then(imp => imp.default)

export interface IWeaponSheet {
  icon: string,
  iconAwaken: string,
  document: DocumentSection[],
}
// This is the weapon Data.displays merged together for each weapons.
const displayDataMap = weaponSheets.then(as =>
  Object.fromEntries(allWeaponTypeKeys.map(k =>
    [k, mergeData(Object.values(as).filter(sheet => sheet.weaponType === k).map(sheet => ({ display: sheet.data.display })))]
  )) as Record<WeaponTypeKey, Data>
)

export type AllWeaponSheets = (weaponKey: WeaponKey) => WeaponSheet
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
  static get = (weaponKey: WeaponKey | ""): Promise<WeaponSheet> | undefined => weaponKey ? weaponSheets.then(w => w[weaponKey]) : undefined
  static get getAll(): Promise<AllWeaponSheets> { return weaponSheets.then(ws => (weaponKey: WeaponKey): WeaponSheet => ws[weaponKey]) }
  static getAllDataOfType(weaponType: WeaponTypeKey) { return displayDataMap.then(map => map[weaponType]) }
  static getWeaponsOfType = (sheets: StrictDict<WeaponKey, WeaponSheet>, weaponType: string): Dict<WeaponKey, WeaponSheet> => Object.fromEntries(Object.entries(sheets).filter(([_, sheet]) => (sheet as WeaponSheet).weaponType === weaponType))
  static getLevelString = (weapon: ICachedWeapon) => getLevelString(weapon.level, weapon.ascension)
  tr = (strKey: string) => <Translate ns={`weapon_${this.key}_gen`} key18={strKey} />
  get name() { return this.tr("name") }
  get hasRefinement() { return this.rarity > 2 }
  get passiveName() { return this.hasRefinement ? this.tr("passiveName") : "" }
  get description() { return this.tr("description") }
  passiveDescription = (refineIndex: number) => this.hasRefinement ? this.tr(`passiveDescription.${refineIndex}`) : ""
  get document() { return this.sheet.document }
  getImg(ascsion: number) {
    return ascsion < 2 ? this.sheet.icon : this.sheet.iconAwaken
  }
}
export const headerTemplate = (weaponKey: WeaponKey, img: string, imgAwaken: string, action?: Displayable): IDocumentHeader => {
  const tr = (strKey: string) => <Translate ns={`weapon_${weaponKey}_gen`} key18={strKey} />
  return {
    title: tr(`passiveName`),
    icon: data => <ImgIcon size={2} sx={{ m: -1 }} src={data.get(input.weapon.asc).value < 2 ? img : imgAwaken} />,
    action: action && <SqBadge color="success">{action}</SqBadge>,
    description: data => tr(`passiveDescription.${data.get(input.weapon.refineIndex).value}`)
  }
}

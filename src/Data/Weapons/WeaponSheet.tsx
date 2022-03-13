import { Translate } from '../../Components/Translate';
import { Data } from '../../Formula/type';
import { Rarity, WeaponKey, WeaponTypeKey } from '../../Types/consts';
import { DocumentSection } from '../../Types/sheet';
import { ICachedWeapon } from '../../Types/weapon_WR';
import { ambiguousLevel, ambiguousLevelLow, ascensionMaxLevel, lowRarityMilestoneLevels, milestoneLevels } from '../LevelData';
import type { WeaponData } from 'pipeline';
import IConditional from '../../Types/IConditional_WR';
import ImgIcon from '../../Components/Image/ImgIcon';
import { input } from '../../Formula';
import SqBadge from '../../Components/SqBadge';
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
  constructor(key: WeaponKey, weaponSheet: IWeaponSheet, weaponData: WeaponData, data: Data) {
    this.rarity = weaponData.rarity
    this.weaponType = weaponData.weaponType
    this.key = key
    this.sheet = weaponSheet
    this.data = data
  }
  static get = (weaponKey: WeaponKey | ""): Promise<WeaponSheet> | undefined => weaponKey ? weaponSheets.then(w => w[weaponKey]) : undefined
  static get getAll() { return weaponSheets }
  static getWeaponsOfType = (sheets: StrictDict<WeaponKey, WeaponSheet>, weaponType: string): Dict<WeaponKey, WeaponSheet> => Object.fromEntries(Object.entries(sheets).filter(([key, sheet]) => (sheet as WeaponSheet).weaponType === weaponType))
  static getLevelString = (weapon: ICachedWeapon): string => `${weapon.level}/${ascensionMaxLevel[weapon.ascension]}`
  tr = (strKey: string) => <Translate ns={`weapon_${this.key}_gen`} key18={strKey} />
  get name() { return this.tr("name") }
  get hasRefinement() { return this.rarity > 2 }
  get passiveName() { return this.hasRefinement ? this.tr("passiveName") : "" }
  get description() { return this.tr("description") }
  passiveDescription = (refineIndex: number) => this.hasRefinement ? this.tr(`passiveDescription.${refineIndex}`) : ""
  get img() { return this.sheet.icon }
  get imgAwaken() { return this.sheet.iconAwaken }
  get document() { return this.sheet.document }
  get milestoneLevels(): Array<[number, number]> {
    if (this.hasRefinement) return milestoneLevels as any
    else return lowRarityMilestoneLevels as any
  }
  ambiguousLevel(level: number) {
    if (this.hasRefinement) return ambiguousLevel(level)
    else return ambiguousLevelLow(level)
  }
}
export const conditionalHeader = (tr: (string) => Displayable, img: string, imgAwaken: string, action?: Displayable): IConditional["header"] => ({
  title: tr(`passiveName`),
  icon: data => <ImgIcon size={2} sx={{ m: -1 }} src={data.get(input.weapon.asc).value < 2 ? img : imgAwaken} />,
  action: action && <SqBadge color="success">{action}</SqBadge>,
})

export const conditionaldesc = (tr: (string) => Displayable) =>
  data => tr(`passiveDescription.${data.get(input.weapon.refineIndex).value}`)

import { WeaponExpCurveData } from 'pipeline';
import { Translate } from '../Components/Translate';
import { ascensionMaxLevel } from '../Data/CharacterData';
import Stat from '../Stat';
import { allWeaponKeys, WeaponKey } from '../Types/consts';
import { ICalculatedStats } from '../Types/stats';
import { ICachedWeapon, IWeaponSheet } from '../Types/weapon';
import { evalIfFunc, objectFromKeyMap } from '../Util/Util';
import expCurveJSON from './expCurve_gen.json';
const expCurve = expCurveJSON as WeaponExpCurveData

export const weaponImport = import('../Data/Weapons').then(async imp => {
  await import('../Data/formula') // TODO: remove this once we can ensure that formula is properly initiated everytime the weapon sheets are loaded
  return Object.fromEntries(Object.entries(imp.default).map(([weaponKey, value]) =>
    [weaponKey, new WeaponSheet(weaponKey, value)])) as unknown as StrictDict<WeaponKey, WeaponSheet>
})

const loadWeaponSheet = objectFromKeyMap(allWeaponKeys, set => weaponImport.then(sheets => sheets[set]))

export default class WeaponSheet {
  sheet: IWeaponSheet;
  key: WeaponKey;
  constructor(key: string, weaponSheet: IWeaponSheet) {
    this.key = key as WeaponKey
    this.sheet = weaponSheet
  }
  static get = (weaponKey: WeaponKey | ""): Promise<WeaponSheet> | undefined => weaponKey ? loadWeaponSheet[weaponKey] : undefined
  static getAll = (): Promise<StrictDict<WeaponKey, WeaponSheet>> => weaponImport
  static getWeaponsOfType = (sheets: StrictDict<WeaponKey, WeaponSheet>, weaponType: string): Dict<WeaponKey, WeaponSheet> => Object.fromEntries(Object.entries(sheets).filter(([key, sheet]) => (sheet as WeaponSheet).weaponType === weaponType))
  static getLevelString = (weapon: ICachedWeapon): string => `${weapon.level}/${ascensionMaxLevel[weapon.ascension]}`
  tr = (strKey: string) => <Translate ns={`weapon_${this.key}_gen`} key18={strKey} />
  get name() { return this.tr("name") }
  //when there is no substat, assume there is no passive. 
  get passiveName() { return this.getSubStatKey() ? this.tr("passiveName") : "" }
  get description() { return this.tr("description") }
  passiveDescription = (stats: ICalculatedStats) => this.getSubStatKey() ? this.tr(`passiveDescription.${stats.weapon.refineIndex}`) : ""
  get weaponType() { return this.sheet.weaponType }
  get img() { return this.sheet.img }
  get rarity() { return this.sheet.rarity }
  stats = (build: ICalculatedStats): object | undefined => evalIfFunc(this.sheet.stats, build) || {}
  get conditionals() { return this.sheet.conditionals }
  get document() { return this.sheet.document }
  getMainStatValue = (level = 1, ascension = 0) => {
    const { type, base, curve } = this.sheet.mainStat
    return base * expCurve[curve][level] + (this.sheet.ascension[ascension]?.addStats?.[type] ?? 0)
  }
  getSubStatValue = (level = 1, ascension = 0) => {
    if (!this.sheet.subStat) return 0
    let { type, base, curve } = this.sheet.subStat
    if (Stat.getStatUnit(type) === "%") base = base * 100
    return base * expCurve[curve][level] + (this.sheet.ascension[ascension]?.addStats?.[type] ?? 0)
  }
  getSubStatKey = () => this.sheet.subStat?.type ?? ""
}

import { WeaponExpCurveData } from 'pipeline';
import { Translate } from '../Components/Translate';
import { ascensionMaxLevel } from '../Data/LevelData';
import { Data } from '../Formula/type';
import { WeaponKey } from '../Types/consts';
import { ICalculatedStats } from '../Types/stats';
import { ICachedWeapon, IWeaponSheet } from '../Types/weapon_WR';
import { evalIfFunc, objectMap } from '../Util/Util';
import expCurveJSON from './expCurve_gen.json';
const expCurve = expCurveJSON as WeaponExpCurveData

export const weaponImport = import('../Data/Weapons/index_WR')

const weaponSheets = weaponImport.then(imp => objectMap(imp.default, (weapon, key) => new WeaponSheet(key, weapon.default, weapon.data))) as Promise<Record<WeaponKey, WeaponSheet>>

export default class WeaponSheet {
  key: WeaponKey;
  sheet: IWeaponSheet;
  data: Data;
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
  // get passiveName() { return this.getSubStatKey() ? this.tr("passiveName") : "" }
  get description() { return this.tr("description") }
  // passiveDescription = (stats: ICalculatedStats) => this.getSubStatKey() ? this.tr(`passiveDescription.${stats.weapon.refineIndex}`) : ""
  get weaponType() { return this.sheet.weaponType }
  get img() { return this.sheet.icon }
  get imgAwaken() { return this.sheet.iconAwaken }
  get rarity() { return this.sheet.rarity }
  stats = (build: ICalculatedStats): object | undefined => evalIfFunc(this.sheet.stats, build) || {}
  get document() { return this.sheet.document }
  // getMainStatValue = (level = 1, ascension = 0) => {
  //   const { type, base, curve } = this.sheet.mainStat
  //   return base * expCurve[curve][level] + (this.sheet.ascension[ascension]?.addStats?.[type] ?? 0)
  // }
  // getSubStatValue = (level = 1, ascension = 0) => {
  //   if (!this.sheet.subStat) return 0
  //   let { type, base, curve } = this.sheet.subStat
  //   if (Stat.getStatUnit(type) === "%") base = base * 100
  //   return base * expCurve[curve][level] + (this.sheet.ascension[ascension]?.addStats?.[type] ?? 0)
  // }
  // getSubStatKey = () => this.sheet.subStat?.type ?? ""
}

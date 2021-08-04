import { WeaponData } from "../../pipeline";
import { SubstatKey } from "./artifact";
import { DocumentSection } from "./character";
import { Rarity, WeaponKey, WeaponTypeKey } from "./consts";
import { BasicStats, BonusStats } from "./stats";
import { IConditionals } from "./IConditional";

export type IWeaponSheets = Record<WeaponKey, IWeaponSheet>

export interface IWeaponSheet extends WeaponData {
  img: string;
  stats?: BonusStats | ((stats: BasicStats) => BonusStats)
  conditionals?: IConditionals
  document: DocumentSection[],
}
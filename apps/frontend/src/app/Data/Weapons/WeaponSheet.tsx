import { weaponAsset } from '@genshin-optimizer/gi/assets'
import type {
  RarityKey,
  WeaponKey,
  WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import type { WeaponData } from '@genshin-optimizer/gi/stats'
import { getLevelString } from '@genshin-optimizer/gi/util'
import { displayDataMap } from '.'
import ImgIcon from '../../Components/Image/ImgIcon'
import SqBadge from '../../Components/SqBadge'
import { input } from '../../Formula'
import type { Data } from '../../Formula/type'
import type { IDocumentHeader } from '../../Types/sheet'
import { trans } from '../SheetUtil'
import type { IWeaponSheet } from './IWeaponSheet'

export default class WeaponSheet {
  readonly key: WeaponKey
  readonly sheet: IWeaponSheet
  readonly data: Data
  readonly rarity: RarityKey
  readonly weaponType: WeaponTypeKey
  constructor(
    key: WeaponKey,
    weaponSheet: IWeaponSheet,
    weaponData: WeaponData,
    data: Data
  ) {
    this.rarity = weaponData.rarity
    this.weaponType = weaponData.weaponType
    this.key = key
    this.sheet = weaponSheet
    this.data = data
  }

  static trm(key: WeaponKey) {
    return trans('weapon', key)[1]
  }
  static tr(key: WeaponKey) {
    return trans('weapon', key)[0]
  }

  static getAllDataOfType(weaponType: WeaponTypeKey) {
    return displayDataMap[weaponType]
  }
  static getWeaponsOfType = (
    sheets: StrictDict<WeaponKey, WeaponSheet>,
    weaponType: string
  ): Dict<WeaponKey, WeaponSheet> =>
    Object.fromEntries(
      Object.entries(sheets).filter(
        ([_, sheet]) => (sheet as WeaponSheet).weaponType === weaponType
      )
    )
  static getLevelString = (weapon: ICachedWeapon) =>
    getLevelString(weapon.level, weapon.ascension)
  get tr() {
    return WeaponSheet.tr(this.key)
  }
  get name() {
    return this.tr('name')
  }
  get hasRefinement() {
    return this.rarity > 2
  }
  get passiveName() {
    return this.hasRefinement ? this.tr('passiveName') : ''
  }
  get description() {
    return this.tr('description')
  }
  passiveDescription = (refineIndex: number) =>
    this.hasRefinement ? this.tr(`passiveDescription.${refineIndex}`) : ''
  get document() {
    return this.sheet.document
  }
}
export function headerTemplate(
  weaponKey: WeaponKey,
  action?: Displayable
): IDocumentHeader {
  const tr = WeaponSheet.tr(weaponKey)
  return {
    title: tr(`passiveName`),
    icon: (data) => (
      <ImgIcon
        size={2}
        src={weaponAsset(weaponKey, data.get(input.weapon.asc).value >= 2)}
      />
    ),
    action: action && <SqBadge color="success">{action}</SqBadge>,
    description: (data) =>
      tr(`passiveDescription.${data.get(input.weapon.refinement).value - 1}`),
  }
}

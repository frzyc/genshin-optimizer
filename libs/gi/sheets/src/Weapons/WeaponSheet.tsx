import { ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import { weaponAsset } from '@genshin-optimizer/gi/assets'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import type { UIData } from '@genshin-optimizer/gi/uidata'
import type { Data } from '@genshin-optimizer/gi/wr'
import { input } from '@genshin-optimizer/gi/wr'
import type { ReactNode } from 'react'
import { trans } from '../SheetUtil'
import type { IDocumentHeader } from '../sheet'
import type { IWeaponSheet } from './IWeaponSheet'

export class WeaponSheet {
  readonly sheet: IWeaponSheet
  readonly data: Data
  constructor(weaponSheet: IWeaponSheet, data: Data) {
    this.sheet = weaponSheet
    this.data = data
  }

  get document() {
    return this.sheet.document
  }
}
export function headerTemplate(
  weaponKey: WeaponKey,
  action?: ReactNode
): IDocumentHeader {
  const [tr] = trans('weapon', weaponKey)
  return {
    title: tr('passiveName'),
    icon: (data: UIData) => (
      <ImgIcon
        size={2}
        src={weaponAsset(weaponKey, data.get(input.weapon.asc).value >= 2)}
      />
    ),
    action: action && <SqBadge color="success">{action}</SqBadge>,
    description: (data: UIData) =>
      tr(`passiveDescription.${data.get(input.weapon.refinement).value - 1}`),
  }
}

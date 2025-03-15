import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { relicAsset } from '@genshin-optimizer/sr/assets'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { formulas } from '@genshin-optimizer/sr/formula'
import { getRelicInterpolateObject } from '@genshin-optimizer/sr/stats'
import { getDefaultRelicSlot } from '@genshin-optimizer/sr/util'
import { trans } from '../../util'

const key: RelicSetKey = 'GuardOfWutheringSnow'
const [chg, _ch] = trans('relic', key)
const icon = relicAsset(key, getDefaultRelicSlot(key))
const formula = formulas[key]

const sheet: UISheet<'2' | '4'> = {
  2: {
    title: '2-Set', // TODO: L10n
    img: icon,
    documents: [
      {
        type: 'text',
        text: chg('setEffects.2', getRelicInterpolateObject(key, 2)),
      },
    ],
  },
  4: {
    title: '4-Set', // TODO: L10n
    img: icon,
    documents: [
      {
        type: 'text',
        text: chg('setEffects.4', getRelicInterpolateObject(key, 4)),
      },
      {
        type: 'fields',
        fields: [
          {
            title: 'Healing',
            fieldRef: formula.set4_heal.tag,
          },
        ],
      },
    ],
  },
}
export default sheet

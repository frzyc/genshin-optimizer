import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { relicAsset } from '@genshin-optimizer/sr/assets'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { buffs } from '@genshin-optimizer/sr/formula'
import { getRelicInterpolateObject } from '@genshin-optimizer/sr/stats'
import { StatDisplay } from '@genshin-optimizer/sr/ui'
import { getDefaultRelicSlot } from '@genshin-optimizer/sr/util'
import { trans } from '../../util'

const key: RelicSetKey = 'IronCavalryAgainstTheScourge'
const [chg, _ch] = trans('relic', key)
const icon = relicAsset(key, getDefaultRelicSlot(key))
const buff = buffs[key]

const sheet: UISheet<'2' | '4'> = {
  2: {
    title: '2-Set', // TODO: L10n
    img: icon,
    documents: [
      {
        type: 'text',
        text: chg('setEffects.2', getRelicInterpolateObject(key, 2)),
      },
      {
        type: 'fields',
        fields: [
          {
            title: <StatDisplay statKey="brEffect_" />,
            fieldRef: buff.set2_passive_brEffect_.tag,
          },
        ],
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
            // TODO: change to StatDisplay
            title: 'Break DEF Ignore%',
            fieldRef: buff.set4_break_defIgn_.tag,
          },
          {
            // TODO: change to StatDisplay
            title: 'Super Break DEF Ignore%',
            fieldRef: buff.set4_superBreak_defIgn_.tag,
          },
        ],
      },
    ],
  },
}
export default sheet

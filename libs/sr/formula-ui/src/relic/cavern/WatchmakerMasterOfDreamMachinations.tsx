import { ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import type { UISheet } from '@genshin-optimizer/pando/ui-sheet'
import { relicAsset } from '@genshin-optimizer/sr/assets'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { buffs, conditionals } from '@genshin-optimizer/sr/formula'
import { mappedStats } from '@genshin-optimizer/sr/stats'
import { StatDisplay } from '@genshin-optimizer/sr/ui'
import { getDefaultRelicSlot } from '@genshin-optimizer/sr/util'
import { trans } from '../../util'
const key: RelicSetKey = 'WatchmakerMasterOfDreamMachinations'
const [chg, _ch] = trans('relic', key)
const dm = mappedStats.relic[key]
const icon = relicAsset(key, getDefaultRelicSlot(key))
const cond = conditionals[key]
const buff = buffs[key]
const sheet: UISheet<'2' | '4'> = {
  2: {
    title: '2-Set', // TODO: L10n
    img: icon,
    documents: [
      {
        type: 'text',
        text: chg('setEffects.2'), // TODO: getInterpolateObject for relics
      },
      {
        type: 'fields',
        fields: [
          {
            title: <StatDisplay statKey="brEffect_" />,
            fieldValue: dm[2].brEffect_,
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
        text: chg('setEffects.4'), // TODO: getInterpolateObject for relics
      },
      {
        type: 'conditional',
        conditional: {
          targeted: true,
          header: {
            icon: <ImgIcon src={icon} />,
            text: 'Use Their Ult on an ally', // TODO: L10n
            additional: <SqBadge>4-Set</SqBadge>, // TODO: L10n
          },
          metadata: cond.useUltimateOnAlly,
          label: '4-Set',
          fields: [
            {
              title: <StatDisplay statKey="brEffect_" />,
              fieldRef: buff.set4_brEffect_.tag,
            },
            /// TODO: translate DM "Duration"
            { title: 'Duration', fieldValue: dm['4'].duration },
          ],
        },
      },
    ],
  },
}
export default sheet

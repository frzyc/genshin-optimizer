import { ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { relicAsset } from '@genshin-optimizer/sr/assets'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { buffs, conditionals } from '@genshin-optimizer/sr/formula'
import { getRelicInterpolateObject } from '@genshin-optimizer/sr/stats'
import { StatDisplay } from '@genshin-optimizer/sr/ui'
import { getDefaultRelicSlot } from '@genshin-optimizer/sr/util'
import { trans } from '../../util'

const key: RelicSetKey = 'DuranDynastyOfRunningWolves'
const [chg, _ch] = trans('relic', key)
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
        text: chg('setEffects.2', getRelicInterpolateObject(key, 2)),
      },
      {
        type: 'conditional',
        conditional: {
          header: {
            icon: <ImgIcon src={icon} />,
            text: 'Ally used follow-up attack', // TODO: L10n
            additional: <SqBadge>4-Set</SqBadge>, // TODO: L10n
          },
          metadata: cond.merit,
          label: '4-Set',
          fields: [
            {
              title: <StatDisplay statKey="dmg_" />,
              fieldRef: buff.set2_followUp_dmg_.tag,
            },
            {
              title: <StatDisplay statKey="crit_dmg_" />,
              fieldRef: buff.set2_crit_dmg_.tag,
            },
          ],
        },
      },
    ],
  },
}
export default sheet

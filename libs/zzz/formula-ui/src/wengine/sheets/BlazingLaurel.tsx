import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { BlazingLaurel } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'BlazingLaurel'
const [chg, ch] = trans('wengine', key)
const dm = mappedStats.wengine[key]
const icon = wengineAsset(key, 'icon')
const cond = BlazingLaurel.conditionals
const buff = BlazingLaurel.buffs

const sheet: UISheetElement = {
  title: chg('phase'),
  img: icon,
  documents: [
    {
      type: 'text',
      text: (
        <PhaseWrapper wKey={key}>
          {(phase) => chg(`phaseDescs.${phase - 1}`)}
        </PhaseWrapper>
      ),
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('cond1'),
        metadata: cond.quickOrPerfectAssistUsed,
        fields: [
          tagToTagField(buff.impact_.tag),
          {
            title: 'Duration', // TODO: L10n,
            fieldValue: dm.duration,
          },
        ],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('cond2'),
        metadata: cond.wilt,
        fields: [
          tagToTagField(buff.crit_dmg_ice_.tag),
          tagToTagField(buff.crit_dmg_fire_.tag),
          {
            title: 'Duration', // TODO: L10n,
            fieldValue: dm.wilt_duration,
          },
        ],
      },
    },
  ],
}

export default sheet

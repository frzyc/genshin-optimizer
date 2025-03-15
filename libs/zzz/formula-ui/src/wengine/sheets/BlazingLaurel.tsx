import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { TagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'BlazingLaurel'
const [chg, ch] = trans('wengine', key)
const dm = mappedStats.wengine[key]
const icon = wengineAsset(key, 'icon')
const cond = conditionals[key]
const buff = buffs[key]

const sheet: UISheetElement = {
  title: chg('passive.name'),
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
          TagToTagField(buff.impact_.tag),
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
          TagToTagField(buff.crit_dmg_ice_.tag),
          TagToTagField(buff.crit_dmg_fire_.tag),
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

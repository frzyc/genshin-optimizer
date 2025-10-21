import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { PracticedPerfection } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { st, tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'PracticedPerfection'
const [chg, _ch] = trans('wengine', key)
const dm = mappedStats.wengine[key]
const icon = wengineAsset(key, 'icon')
const cond = PracticedPerfection.conditionals
const buff = PracticedPerfection.buffs

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
      type: 'fields',
      fields: [tagToTagField(buff.anomMas.tag)],
    },
    {
      type: 'conditional',
      conditional: {
        metadata: cond.stacks,
        label: st('stacks'),
        fields: [
          tagToTagField(buff.stacks_phys_dmg_.tag),
          {
            title: st('duration'),
            fieldValue: dm.duration,
          },
        ],
      },
    },
  ],
}

export default sheet

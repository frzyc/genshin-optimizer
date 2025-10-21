import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { Housekeeper } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'Housekeeper'
const [chg, ch] = trans('wengine', key)
const dm = mappedStats.wengine[key]
const icon = wengineAsset(key, 'icon')
const cond = Housekeeper.conditionals
const buff = Housekeeper.buffs

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
        metadata: cond.offField,
        fields: [tagToTagField(buff.enerRegen.tag)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('cond2'),
        metadata: cond.exSpecialHits,
        fields: [
          tagToTagField(buff.physical_dmg_.tag),
          {
            title: 'Duration', // TODO: L10n,
            fieldValue: dm.duration,
          },
        ],
      },
    },
  ],
}

export default sheet

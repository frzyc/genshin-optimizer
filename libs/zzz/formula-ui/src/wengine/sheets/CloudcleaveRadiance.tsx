import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { CloudcleaveRadiance } from '@genshin-optimizer/zzz/formula'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'CloudcleaveRadiance'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = CloudcleaveRadiance.conditionals
const buff = CloudcleaveRadiance.buffs

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
      fields: [tagToTagField(buff.passive_physical_resIgn_.tag)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('activatesEtherVeil'),
        metadata: cond.activatesEtherVeil,
        fields: [
          tagToTagField(buff.cond_common_dmg_.tag),
          tagToTagField(buff.cond_crit_dmg_.tag),
        ],
      },
    },
  ],
}

export default sheet

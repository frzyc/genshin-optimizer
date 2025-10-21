import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'DreamlitHearth'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = conditionals[key]
const buff = buffs[key]

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
      fields: [tagToTagField(buff.enerRegen.tag)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('cond'),
        metadata: cond.etherVeilActive,
        fields: [
          tagToTagField(buff.common_dmg_.tag),
          tagToTagField(buff.hp_.tag),
        ],
      },
    },
  ],
}

export default sheet

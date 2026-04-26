import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { NeonFantasies } from '@genshin-optimizer/zzz/formula'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'NeonFantasies'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = NeonFantasies.conditionals
const buff = NeonFantasies.buffs

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
      fields: [tagToTagField(buff.passive_anomProf.tag)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('cond'),
        metadata: cond.ether_exSpecial_basic,
        fields: [
          tagToTagField(buff.cond_common_dmg_.tag),
          tagToTagField(buff.cond_anomProf.tag),
        ],
      },
    },
  ],
}

export default sheet

import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { SteelCushion } from '@genshin-optimizer/zzz/formula'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'SteelCushion'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = SteelCushion.conditionals
const buff = SteelCushion.buffs

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
      fields: [tagToTagField(buff.passive_physical_dmg_.tag)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('cond'),
        metadata: cond.hit_behind,
        fields: [tagToTagField(buff.cond_dmg_.tag)],
      },
    },
  ],
}

export default sheet

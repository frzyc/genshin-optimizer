import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { BellicoseBlaze } from '@genshin-optimizer/zzz/formula'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'BellicoseBlaze'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = BellicoseBlaze.conditionals
const buff = BellicoseBlaze.buffs

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
      fields: [tagToTagField(buff.passive_crit_.tag)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('cond'),
        metadata: cond.fire_aftershocks,
        fields: [tagToTagField(buff.cond_fire_aftershock_defIgn_.tag)],
      },
    },
  ],
}

export default sheet

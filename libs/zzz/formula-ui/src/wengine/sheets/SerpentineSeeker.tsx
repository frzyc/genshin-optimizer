import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { SerpentineSeeker } from '@genshin-optimizer/zzz/formula'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'SerpentineSeeker'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = SerpentineSeeker.conditionals
const buff = SerpentineSeeker.buffs

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
        metadata: cond.energyConsumed,
        fields: [tagToTagField(buff.cond_electric_defIgn_.tag)],
      },
    },
  ],
}

export default sheet

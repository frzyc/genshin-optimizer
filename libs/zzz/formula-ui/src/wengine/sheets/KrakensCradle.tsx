import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { KrakensCradle } from '@genshin-optimizer/zzz/formula'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'KrakensCradle'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = KrakensCradle.conditionals
const buff = KrakensCradle.buffs

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
        metadata: cond.hpDecreased,
        fields: [tagToTagField(buff.ice_sheer_dmg_.tag)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('cond2'),
        metadata: cond.hpBelow50,
        fields: [tagToTagField(buff.crit_.tag)],
      },
    },
  ],
}

export default sheet

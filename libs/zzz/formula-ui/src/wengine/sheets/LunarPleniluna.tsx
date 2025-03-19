import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { buffs } from '@genshin-optimizer/zzz/formula'
import { StatDisplay } from '@genshin-optimizer/zzz/ui'
import { trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'LunarPleniluna'
const [chg, _ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
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
      type: 'fields',
      fields: [
        // TODO: change to basic, dash and dodgeCounter dmg respectively
        {
          title: <StatDisplay statKey="dmg_" />,
          fieldRef: buff.basic_dmg_.tag,
        },
        {
          title: <StatDisplay statKey="dmg_" />,
          fieldRef: buff.dash_dmg_.tag,
        },
        {
          title: <StatDisplay statKey="dmg_" />,
          fieldRef: buff.dodgeCounter_dmg_.tag,
        },
      ],
    },
  ],
}

export default sheet

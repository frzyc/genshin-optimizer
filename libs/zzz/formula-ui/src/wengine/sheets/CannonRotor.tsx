import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { CannonRotor } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'CannonRotor'
const [chg, _ch] = trans('wengine', key)
const dm = mappedStats.wengine[key]
const icon = wengineAsset(key, 'icon')
const formula = CannonRotor.formulas
const buff = CannonRotor.buffs

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
      fields: [tagToTagField(buff.passive_atk_.tag)],
    },
    {
      type: 'fields',
      fields: [
        {
          title: 'Additional DMG',
          fieldRef: formula.damage.tag,
        },
        {
          title: 'Cooldown',
          fieldValue: (
            <PhaseWrapper wKey={key}>
              {(phase) => dm.cooldown[phase]}
            </PhaseWrapper>
          ),
        },
      ],
    },
  ],
}

export default sheet

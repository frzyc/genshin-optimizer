import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { HalfSugarBunny } from '@genshin-optimizer/zzz/formula'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'HalfSugarBunny'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = HalfSugarBunny.conditionals
const buff = HalfSugarBunny.buffs

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
      fields: [
        tagToTagField(buff.passive_enerRegen.tag),
        tagToTagField(buff.passive_atk_.tag),
        tagToTagField(buff.passive_hp_.tag),
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('activateExtendEtherVeil'),
        metadata: cond.activateExtendEtherVeil,
        fields: [tagToTagField(buff.cond_crit_dmg_.tag)],
      },
    },
  ],
}

export default sheet

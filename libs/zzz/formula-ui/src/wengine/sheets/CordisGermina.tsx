import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { CordisGermina } from '@genshin-optimizer/zzz/formula'
import { st, tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'CordisGermina'
const [chg, _ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = CordisGermina.conditionals
const buff = CordisGermina.buffs

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
        label: st('uponHit.2', {
          val1: '$t(skills.basic)',
          val2: '$t(skills.exSpecial)',
        }),
        metadata: cond.basic_exSpecial_used,
        fields: [
          tagToTagField(buff.cond_electric_dmg_.tag),
          tagToTagField(buff.cond_basic_defIgn_.tag),
          tagToTagField(buff.cond_ult_defIgn_.tag),
        ],
      },
    },
  ],
}

export default sheet

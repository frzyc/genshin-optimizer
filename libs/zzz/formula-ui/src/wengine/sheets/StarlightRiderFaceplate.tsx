import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { StarlightRiderFaceplate } from '@genshin-optimizer/zzz/formula'
import { st, tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'StarlightRiderFaceplate'
const [chg, _ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = StarlightRiderFaceplate.conditionals
const buff = StarlightRiderFaceplate.buffs

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
        label: st('uponLaunch.1', { val1: '$t(skills.special)' }),
        metadata: cond.specialUsed,
        fields: [tagToTagField(buff.cond_physical_sheer_dmg_.tag)],
      },
    },
  ],
}

export default sheet

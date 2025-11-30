import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { WrathfulVajra } from '@genshin-optimizer/zzz/formula'
import { st, tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'WrathfulVajra'
const [chg, _ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = WrathfulVajra.conditionals
const buff = WrathfulVajra.buffs

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
        label: st('uponLaunch.2', {
          val1: '$t(skills.exSpecial)',
          val2: '$t(skills.assistFollowUp)',
        }),
        metadata: cond.exSpecialAssistLaunched,
        fields: [tagToTagField(buff.cond_fire_sheer_dmg_.tag)],
      },
    },
  ],
}

export default sheet

import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { Metanukimorphosis } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { st, tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'Metanukimorphosis'
const [chg, ch] = trans('wengine', key)
const dm = mappedStats.wengine[key]
const icon = wengineAsset(key, 'icon')
const cond = Metanukimorphosis.conditionals
const buff = Metanukimorphosis.buffs

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
        metadata: cond.physical_exSpecial_ult,
        label: ch('physical_exSpecial_ult_cond'),
        fields: [
          tagToTagField(buff.physical_exSpecial_ult_anomMas.tag),
          {
            title: st('duration'),
            fieldValue: dm.amDuration,
          },
        ],
      },
    },
    {
      type: 'conditional',
      conditional: {
        metadata: cond.aftershock,
        label: st('uponHit.1', {
          val1: '$t(skills.aftershock)',
        }),
        fields: [
          tagToTagField(buff.aftershock_team_anomProf.tag),
          {
            title: st('duration'),
            fieldValue: dm.apDuration,
          },
        ],
      },
    },
  ],
}

export default sheet

import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { st, tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'RoaringFurnace'
const [chg, ch] = trans('wengine', key)
const dm = mappedStats.wengine[key]
const icon = wengineAsset(key, 'icon')
const cond = conditionals[key]
const buff = buffs[key]

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
        tagToTagField(buff.exSpecial_dazeInc_.tag),
        tagToTagField(buff.chain_dazeInc_.tag),
        tagToTagField(buff.ult_dazeInc_.tag),
      ],
    },
    {
      type: 'conditional',
      conditional: {
        metadata: cond.chainOrUlt,
        label: ch('cond'),
        fields: [
          tagToTagField(buff.team_chainOrUlt_fire_dmg_.tag),
          {
            title: st('duration'),
            fieldValue: dm.duration,
          },
        ],
      },
    },
  ],
}

export default sheet

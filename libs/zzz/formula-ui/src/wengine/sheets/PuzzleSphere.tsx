import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { st, tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'PuzzleSphere'
const [chg] = trans('wengine', key)
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
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.1', { val1: '$t(skills.exSpecial)' }),
        metadata: cond.launchingExSpecial,
        fields: [
          tagToTagField(buff.launchingExSpecial_crit_dmg_.tag),
          {
            title: st('duration'),
            fieldValue: dm.duration,
          },
        ],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: st('targetHpLe', { val: dm.hpThresh * 100 }),
        metadata: cond.targetHpBelow50,
        fields: [tagToTagField(buff.targetHpBelow50_exSpecial_dmg_.tag)],
      },
    },
  ],
}

export default sheet

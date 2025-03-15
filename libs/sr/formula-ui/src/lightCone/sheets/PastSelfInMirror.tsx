import { ImgIcon } from '@genshin-optimizer/common/ui'
import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { lightConeAsset } from '@genshin-optimizer/sr/assets'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { buffs, conditionals } from '@genshin-optimizer/sr/formula'
import {
  getLightConeInterpolateObject,
  mappedStats,
} from '@genshin-optimizer/sr/stats'
import { StatDisplay } from '@genshin-optimizer/sr/ui'
import { trans } from '../../util'
import { SuperImposeWrapper } from '../util'

const key: LightConeKey = 'PastSelfInMirror'

const [chg, _ch] = trans('lightcone', key)
const dm = mappedStats.lightCone[key]
const icon = lightConeAsset(key, 'cover')
const cond = conditionals[key]
const buff = buffs[key]

const sheet: UISheetElement = {
  title: chg('passive.name'),
  img: icon,
  documents: [
    {
      type: 'text',
      text: (
        <SuperImposeWrapper lcKey={key}>
          {(superimpose) =>
            chg(
              'passive.description',
              getLightConeInterpolateObject(key, superimpose)
            )
          }
        </SuperImposeWrapper>
      ),
    },
    {
      type: 'conditional',
      conditional: {
        targeted: true,
        header: {
          icon: <ImgIcon src={icon} sx={{ width: 'auto' }} size={2} />,
          text: chg('passive.name'),
        },
        metadata: cond.ultUsed,
        label: 'Wearer used their Ultimate',
        fields: [
          {
            title: <StatDisplay statKey="dmg_" />,
            fieldRef: buff.common_dmg_.tag,
          },
          // TODO: translate DM "Duration"
          {
            title: 'Duration',
            fieldValue: `${dm.duration}`,
          },
          {
            // TODO: should only show when wearer brEffect_ > dm.brEffect_thresh_[superimpose]
            title: 'Skill Point recovered',
            fieldValue: 1,
          },
        ],
      },
    },
    {
      type: 'fields',
      fields: [
        {
          title: 'Energy regen at the start of each wave',
          fieldValue: (
            <SuperImposeWrapper lcKey={key}>
              {(superimpose) => dm.energy[superimpose]}
            </SuperImposeWrapper>
          ),
        },
      ],
    },
  ],
}

export default sheet

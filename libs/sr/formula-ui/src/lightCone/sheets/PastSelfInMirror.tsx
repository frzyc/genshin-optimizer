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
        metadata: cond.useUltimate,
        label: 'Wearer use their Ultimate',
        fields: [
          {
            title: <StatDisplay statKey="dmg_" />,
            fieldRef: buff.cond_dmg_.tag,
          },
          // TODO: translate DM "Duration"
          {
            title: 'Duration',
            fieldValue: (
              <SuperImposeWrapper lcKey={key}>
                {(superimpose) => dm.duration[superimpose]}
              </SuperImposeWrapper>
            ),
          },
          {
            // TODO: should only show when wearer brEffect_ > dm.brEffect_thresh_[superimpose]
            title: 'Skill POint recovered',
            fieldValue: 1,
          },
        ],
      },
    },
    {
      type: 'fields',
      fields: [
        {
          title: 'Energy regen at start of each wave',
          fieldValue: (
            <SuperImposeWrapper lcKey={key}>
              {(superimpose) => dm.enerRegn[superimpose]}
            </SuperImposeWrapper>
          ),
        },
      ],
    },
  ],
}

export default sheet

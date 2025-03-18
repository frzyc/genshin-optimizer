import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { lightConeAsset } from '@genshin-optimizer/sr/assets'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { buffs, conditionals } from '@genshin-optimizer/sr/formula'
import {
  getLightConeInterpolateObject,
  mappedStats,
} from '@genshin-optimizer/sr/stats'
import { trans } from '../../util'
import { SuperImposeWrapper } from '../util'

const key: LightConeKey = 'Chorus'
const [chg, _ch] = trans('lightcone', key)
// TODO: Cleanup
//@ts-ignore
const _dm = mappedStats.lightCone[key]
const icon = lightConeAsset(key, 'cover')
// TODO: Cleanup
//@ts-ignore
const _cond = conditionals[key]
// TODO: Cleanup
//@ts-ignore
const _buff = buffs[key]

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
  ],
}

export default sheet

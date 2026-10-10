import {
  type ArtifactSetKey,
  absorbableEle,
} from '@genshin-optimizer/gi/consts'
import { cmpGE, cmpNE, prod } from '@genshin-optimizer/pando/engine'
import {
  allListConditionals,
  ownBuff,
  percent,
  stackToken,
  teamBuff,
} from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'ArchaicPetra',
  count = artCount(key)
const { element } = allListConditionals(key, [...absorbableEle])
const { entries: ap4Stack, out: ap4Out } = stackToken(
  'ap4',
  cmpGE(count, 4, cmpNE(element.value, 0, 1))
)

export default registerArt(
  key,
  ownBuff.premod.dmg_.geo.add(cmpGE(count, 2, percent(0.15))),
  ap4Stack,
  ...absorbableEle.map((ele) =>
    teamBuff.premod.dmg_[ele].add(
      prod(
        ap4Out,
        percent(
          element.map({
            hydro: ele === 'hydro' ? 0.35 : 0,
            pyro: ele === 'pyro' ? 0.35 : 0,
            cryo: ele === 'cryo' ? 0.35 : 0,
            electro: ele === 'electro' ? 0.35 : 0,
          })
        )
      )
    )
  )
)

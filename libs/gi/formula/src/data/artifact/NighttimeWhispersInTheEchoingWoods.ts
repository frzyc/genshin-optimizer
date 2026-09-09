import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'NighttimeWhispersInTheEchoingWoods',
  count = artCount(key)
const { afterSkill, crystallize } = allBoolConditionals(key)

export default registerArt(
  key,
  ownBuff.premod.atk_.add(cmpGE(count, 2, percent(0.18))),
  ownBuff.premod.dmg_.geo.add(afterSkill.ifOn(cmpGE(count, 4, percent(0.2)))),
  ownBuff.premod.dmg_.geo.add(
    afterSkill.ifOn(crystallize.ifOn(cmpGE(count, 4, percent(0.2 * 1.5))))
  )
)

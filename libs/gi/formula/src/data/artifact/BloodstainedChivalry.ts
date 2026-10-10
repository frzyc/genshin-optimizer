import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpEq, cmpGE } from '@genshin-optimizer/pando/engine'
import { allListConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'BloodstainedChivalry',
  count = artCount(key)
const { defeat } = allListConditionals(key, ['hit'])

const set4 = cmpEq(defeat.value, 1, cmpGE(count, 4, percent(1)))

export default registerArt(
  key,
  ownBuff.premod.dmg_.physical.add(cmpGE(count, 2, percent(0.25))),
  ownBuff.premod.dmg_.charged.add(
    cmpEq(defeat.value, 1, cmpGE(count, 4, percent(0.5)))
  ),
  ownBuff.premod.staminaChargedDec_.add(set4)
)

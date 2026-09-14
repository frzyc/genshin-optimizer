import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'ScarletProof',
  count = artCount(key)
const { '4Ss': set4Ss } = allBoolConditionals(key)

export default registerArt(
  key,
  ownBuff.premod.atk_.add(cmpGE(count, 2, percent(0.18))),
  ownBuff.premod.critRate_.add(set4Ss.ifOn(cmpGE(count, 4, percent(0.16)))),
  ownBuff.premod.dmg_.stellarswirl.add(
    set4Ss.ifOn(cmpGE(count, 4, percent(0.4)))
  )
)

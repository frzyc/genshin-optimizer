import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, ownBuff, percent, teamBuff } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'MaidenBeloved',
  count = artCount(key)
const { state } = allBoolConditionals(key)

export default registerArt(
  key,
  ownBuff.premod.heal_.add(cmpGE(count, 2, percent(0.15))),
  teamBuff.premod.incHeal_.add(state.ifOn(cmpGE(count, 4, percent(0.2))))
)

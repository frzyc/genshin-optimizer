import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, ownBuff, teamBuff } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'Instructor',
  count = artCount(key)
const { set4 } = allBoolConditionals(key)

export default registerArt(
  key,
  ownBuff.premod.eleMas.add(cmpGE(count, 2, 80)),
  teamBuff.premod.eleMas.addOnce(key, set4.ifOn(cmpGE(count, 4, 120)))
)

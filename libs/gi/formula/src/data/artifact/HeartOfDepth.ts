import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'HeartOfDepth',
  count = artCount(key)
const { skill } = allBoolConditionals(key)

export default registerArt(
  key,
  ownBuff.premod.dmg_.hydro.add(cmpGE(count, 2, percent(0.15))),
  ownBuff.premod.dmg_.normal.add(skill.ifOn(cmpGE(count, 4, percent(0.3)))),
  ownBuff.premod.dmg_.charged.add(skill.ifOn(cmpGE(count, 4, percent(0.3))))
)

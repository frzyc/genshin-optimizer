import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'ThunderingFury',
  count = artCount(key)
const set4Dmg40 = cmpGE(count, 4, percent(0.4))
const set4Dmg20 = cmpGE(count, 4, percent(0.2))

export default registerArt(
  key,
  ownBuff.premod.dmg_.electro.add(cmpGE(count, 2, percent(0.15))),
  ownBuff.premod.dmg_.overloaded.add(set4Dmg40),
  ownBuff.premod.dmg_.electrocharged.add(set4Dmg40),
  ownBuff.premod.dmg_.superconduct.add(set4Dmg40),
  ownBuff.premod.dmg_.hyperbloom.add(set4Dmg40),
  ownBuff.premod.dmg_.aggravate.add(set4Dmg20),
  ownBuff.premod.dmg_.lunarcharged.add(set4Dmg20),
  ownBuff.premod.dmg_.stellarconduct.add(set4Dmg20)
)

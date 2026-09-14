import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'DesertPavilionChronicle',
  count = artCount(key)
// WR cond(key, 'set4'). document.teamBuff is UI-only; data is own premod.
const { set4 } = allBoolConditionals(key)

export default registerArt(
  key,
  ownBuff.premod.dmg_.anemo.add(cmpGE(count, 2, percent(0.15))),
  ownBuff.premod.atkSPD_.add(set4.ifOn(cmpGE(count, 4, percent(0.1)))),
  ownBuff.premod.dmg_.normal.add(set4.ifOn(cmpGE(count, 4, percent(0.4)))),
  ownBuff.premod.dmg_.charged.add(set4.ifOn(cmpGE(count, 4, percent(0.4)))),
  ownBuff.premod.dmg_.plunging.add(set4.ifOn(cmpGE(count, 4, percent(0.4))))
)

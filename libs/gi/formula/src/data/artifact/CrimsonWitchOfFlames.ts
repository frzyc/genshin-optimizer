import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, lookup, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'CrimsonWitchOfFlames',
  count = artCount(key)
const { stack } = allNumConditionals(key, true, 0, 3)

const set4Dmg40 = cmpGE(count, 4, percent(0.4))
const set4Dmg15 = cmpGE(count, 4, percent(0.15))

export default registerArt(
  key,
  ownBuff.premod.dmg_.pyro.add(cmpGE(count, 2, percent(0.15))),
  ownBuff.premod.dmg_.overloaded.add(set4Dmg40),
  ownBuff.premod.dmg_.burning.add(set4Dmg40),
  ownBuff.premod.dmg_.burgeon.add(set4Dmg40),
  ownBuff.premod.dmg_.vaporize.add(set4Dmg15),
  ownBuff.premod.dmg_.melt.add(set4Dmg15),
  ownBuff.premod.dmg_.pyro.add(
    cmpGE(
      count,
      4,
      lookup(
        subscript(stack, ['0', '1', '2', '3']),
        {
          '1': percent((0.15 * 1) / 2),
          '2': percent((0.15 * 2) / 2),
          '3': percent((0.15 * 3) / 2),
        },
        0
      )
    )
  )
)

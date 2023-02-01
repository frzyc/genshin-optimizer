import { cmpEq, cmpGE } from '../../../../waverider/src'
import { allCustoms, allStacks, Artifact, percent, register, selfBuff, teamBuff } from '../util'
import { artCount, entriesForArt } from './util'

const name: Artifact = 'NoblesseOblige', count = artCount(name)
const { set4 } = allCustoms(name), { canNO4 } = allStacks(name)

export default register(name,
  ...entriesForArt(name),
  selfBuff.premod.dmg_.burst.add(cmpGE(count, 2, percent(0.2))),

  canNO4.in.add(cmpGE(count, 4, cmpEq(set4, 'on', 1))),
  teamBuff.premod.atk_.add(cmpEq(canNO4.out, 1, percent(0.2))),
)

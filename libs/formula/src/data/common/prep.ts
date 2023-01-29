import { cmpEq, lookup } from '@genshin-optimizer/waverider'
import { convert, Data, enemy, selfBuff, selfTag } from '../util'

const self = convert(selfTag, { et: 'self' })

const data: Data = [
  selfBuff.prep.amp.add(lookup(self.prep.ele, {
    cryo: cmpEq(enemy.cond.amp, 'melt', 'melt', ''),
    hydro: cmpEq(enemy.cond.amp, 'vaporize', 'vaporize', ''),
    pyro: lookup(enemy.cond.amp, { melt: 'melt', vaporize: 'vaporize' }, ''),
  }, '')),
  selfBuff.prep.cata.add(lookup(self.prep.ele, {
    dendro: cmpEq(enemy.cond.cata, 'spread', 'spread', ''),
    electro: cmpEq(enemy.cond.cata, 'aggravate', 'aggravate', ''),
  }, ''))
]
export default data

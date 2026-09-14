import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, enemyDebuff, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'DeepwoodMemories',
  count = artCount(key)
const { set4 } = allBoolConditionals(key)

export default registerArt(
  key,
  ownBuff.premod.dmg_.dendro.add(cmpGE(count, 2, percent(0.15))),
  // WR nonStackBuff('dm4'). Nilou C2 still `.add`s the same dest and stacks.
  ...enemyDebuff.common.preRes.dendro.addOnce(
    key,
    set4.ifOn(cmpGE(count, 4, percent(-0.3)))
  )
)

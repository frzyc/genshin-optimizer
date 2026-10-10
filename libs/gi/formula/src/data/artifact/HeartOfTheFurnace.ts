import {
  type ArtifactSetKey,
  allStellarReactionKeys,
} from '@genshin-optimizer/gi/consts'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  ownBuff,
  percent,
  stackToken,
  teamBuff,
} from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'HeartOfTheFurnace',
  count = artCount(key)
const { ['4Stellar']: set4Stellar } = allBoolConditionals(key)

const furnaceOn = set4Stellar.ifOn(cmpGE(count, 4, 1))
const { entries: furnaceStack, out: furnaceOut } = stackToken(
  'heartofthefurnace',
  furnaceOn
)

export default registerArt(
  key,
  ownBuff.premod.atk_.add(cmpGE(count, 2, percent(0.18))),
  ownBuff.premod.atk_.add(set4Stellar.ifOn(cmpGE(count, 4, percent(0.12)))),
  furnaceStack,
  ...allStellarReactionKeys.map((k) =>
    teamBuff.premod.dmg_[k].add(prod(furnaceOut, percent(0.5)))
  )
)

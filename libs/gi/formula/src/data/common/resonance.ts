import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, register, team, teamBuff } from '../util'
import { enemyFrozen, hasShield } from './conds'

const count = team.common.count

export const {
  nearbyDendro1, // Burning, Quicken, Bloom
  nearbyDendro2, // Aggravate, Spread, Hyperbloom, Burgeon
} = allBoolConditionals('reso', 'dst')

export default register(
  'reso',
  teamBuff.premod.atk_.add(cmpGE(count.pyro, 2, 0.25)),
  teamBuff.premod.hp_.add(cmpGE(count.hydro, 2, 0.25)),
  teamBuff.premod.critRate_.add(cmpGE(count.cryo, 2, enemyFrozen.ifOn(0.15))),
  teamBuff.premod.dmg_.add(cmpGE(count.geo, 2, hasShield.ifOn(0.2))),
  teamBuff.premod.eleMas.add(cmpGE(count.dendro, 2, nearbyDendro1.ifOn(30))),
  teamBuff.premod.eleMas.add(cmpGE(count.dendro, 2, nearbyDendro2.ifOn(20))),
)

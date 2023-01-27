import { cmpEq, prod, subscript } from '@genshin-optimizer/waverider'
import { Data, elements, self, Weapon } from '../../util'
import { entriesForWeapon, write } from '../util'
import data_gen from './data.gen.json'

const dmg_ = [NaN, 0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = [NaN, 0.032, 0.04, 0.048, 0.056, 0.064]

const name: Weapon = 'CalamityQueller'
const { common, weapon: { refinement } } = self, {
  // Conditional
  custom: { stack },
  output: { selfBuff },
} = write(name)

const atkInc = prod(
  cmpEq(common.isActive, 1,
    1, // TODO Add tag for active char
    2, // TODO Add tag for inactive char
  ),
  stack,
  subscript(refinement, atk_)
)

const data: Data = [
  ...entriesForWeapon(selfBuff, data_gen),
  ...elements.filter(x => x !== 'physical').map(ele =>
    selfBuff.premod.dmg_[ele].addNode(subscript(refinement, dmg_))),
  selfBuff.premod.atk_.addNode(atkInc)
]
export default data

import { sum } from '@genshin-optimizer/waverider'
import { Data, elements, selfBuff, team } from '../util'

const data: Data = [
  team.common.eleCount.add(sum(...elements.map(ele => team.common.count[ele].max)))
]
export default data

import { sum, tag } from '@genshin-optimizer/waverider'
import { Data, elements, reader, team } from '../util'

const data: Data = [
  team.common.eleCount.addNode(tag(sum(...elements.map(ele => team.common.count[ele].max)), reader.withTag({ dst: null }).tag))
]
export default data

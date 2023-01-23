import { min, sum, tag } from "@genshin-optimizer/waverider"
import { Data, elements, reader } from "../util"

const team = reader.withTag({ et: 'self', src: 'team' })

const data: Data = [
  team.team.eleCount.addNode(tag(sum(...elements.map(ele => min(team[ele].team.count, 1))), reader.withTag({ dst: null }).tag))
]
export default data

import { min, sum } from "@genshin-optimizer/waverider"
import { Data, elements, reader } from "../util"

const team = reader.withTag({ et: 'self', src: 'team' })

const data: Data = [
  team.team.eleCount.addNode(sum(...elements.map(ele => min(team[ele].team.count, 1))))
]
export default data

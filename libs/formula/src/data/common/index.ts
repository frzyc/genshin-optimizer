import type { AnyNode, RawTagMapEntries } from "@genshin-optimizer/waverider"
import { base, final, premod, reader, team } from "../util"

const data: RawTagMapEntries<AnyNode> = [
  // Final <= Premod <= Base
  final.addNode(premod),
  premod.addNode(base),
]

export default data

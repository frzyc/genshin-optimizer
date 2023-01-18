import { Data, reader } from "../util"

const nosrc = reader.src('none', 'sum')
const base = nosrc.with('stage', 'base'), premod = nosrc.with('stage', 'premod'), final = nosrc.with('stage', 'final')
const data: Data = [
  // Final <= Premod <= Base
  final.addNode(premod),
  premod.addNode(base),

  nosrc.reread({ src: 'char' }),
  nosrc.reread({ src: 'weapon' }),
  nosrc.reread({ src: 'art' }),
  nosrc.reread({ src: 'team' }),
  nosrc.reread({ src: 'custom' }),
]

export default data

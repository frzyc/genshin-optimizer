import { Data, reader } from "../util"

const nosrc = reader.src('none', 'sum')
const base = nosrc.with('stage', 'base'), premod = nosrc.with('stage', 'premod'), final = nosrc.with('stage', 'final')
const data: Data = [
  // Final <= Premod <= Base
  final.addNode(premod),
  premod.addNode(base),

  nosrc.reread(reader.src('char')),
  nosrc.reread(reader.src('weapon')),
  nosrc.reread(reader.src('art')),
  nosrc.reread(reader.src('team')),
  nosrc.reread(reader.src('custom')),
]

export default data

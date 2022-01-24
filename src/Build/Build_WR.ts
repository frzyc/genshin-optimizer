import { ArtCharDatabase } from "../Database/Database";
import { dataObjForArtifact } from "../Formula/api";
import { forEachNodes, mapFormulas } from "../Formula/internal";
import { constantFold } from "../Formula/optimization";
import { ConstantNode, Data, Node } from "../Formula/type";
import { customRead } from "../Formula/utils";
import { ArtifactSetKey } from "../Types/consts";
import { assertUnreachable } from "../Util/Util";
import { ArtifactBuildData, ArtifactsBySlot } from "./Worker";

export function compactNodes(nodes: Node[]): CompactNodes {
  const affineNodes = new Set<Node>()
  const topLevelAffine = new Set<Node>()

  function visit(node: Node, isAffine: boolean) {
    if (isAffine) affineNodes.add(node)
    else node.operands.forEach(op => affineNodes.has(op) && topLevelAffine.add(op))
  }

  forEachNodes(nodes, _ => { }, f => {
    const operation = f.operation
    switch (operation) {
      case "read": visit(f, f.accumulation === "add"); break
      case "add": visit(f, f.operands.every(op => affineNodes.has(op))); break
      case "mul": {
        const nonConst = f.operands.filter(op => op.operation !== "const")
        visit(f, nonConst.length === 0 || (nonConst.length === 1 && affineNodes.has(nonConst[0])))
        break
      }
      case "const": visit(f, true); break
      case "res": case "threshold_add": case "sum_frac":
      case "max": case "min": visit(f, false); break
      case "data": case "reset":
      case "subscript": case "lookup":
      case "match": case "unmatch":
        throw new Error(`Found unsupported ${operation} node when computing affine nodes`)
      default: assertUnreachable(operation)
    }
  })

  const affine = [...topLevelAffine].filter(f => f.operation !== "const")
  const affineMap = new Map(affine.map((node, i) => [node, customRead(["aff", `${i}`])]))
  nodes = mapFormulas(nodes, f => affineMap.get(f) ?? f, f => f)
  return { nodes, affine }
}
export function compactArtifacts(db: ArtCharDatabase, nodes: CompactNodes, mainStatAssumptionLevel: number): ArtifactsBySlot {
  const result: ArtifactsBySlot = { flower: [], plume: [], goblet: [], circlet: [], sands: [] }
  const base = (constantFold(nodes.affine, undefined, _ => true) as ConstantNode[])
    .map(x => x.value)

  for (const art of db._getArts()) {
    const data = dataObjForArtifact(art, mainStatAssumptionLevel)
    result[art.slotKey].push(compactArtifact(nodes, art.id, art.setKey, data, base))
  }
  return result
}
function compactArtifact(nodes: CompactNodes, id: string, setKey: ArtifactSetKey, art: Data, base: number[]): ArtifactBuildData {
  return {
    id: id,
    set: setKey,
    values: (constantFold(nodes.affine, art, _ => true) as ConstantNode[])
      .map((x, i) => x.value - base[i])
  }
}

type CompactNodes = { nodes: Node[], affine: Node[] }

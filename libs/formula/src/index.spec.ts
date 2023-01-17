import { AnyNode, Calculator, compileTagMapValues, constant, jsonToTagMapValues, TagMap, traverse } from "@genshin-optimizer/waverider";
import { keys, preValues } from "./data";
import { reader, stats, Tag } from "./data/util/read";

const values = jsonToTagMapValues<AnyNode>(preValues)

describe('Genshin Database', () => {
  const r = reader.char('Nahida'), { lvl, ascension, constellation } = r.qq
  const { a1ActiveInBurst, c2Bloom, c2QSA, c4Count } = reader.customQ

  const compiled = compileTagMapValues<AnyNode>(keys, [
    lvl.addNode(constant(12)),
    ascension.addNode(constant(0)),
    constellation.addNode(constant(2)),

    c2Bloom.addNode(constant('on')),

    // Team Buff
    ...stats.map(s => r.q(s).addNode(r.with('char', 'team', 'sum'))),
  ])
  const calc = new Calculator(keys, values, compiled)

  test('Basic Query', () => {
    expect(calc._compute(r.final.q('def')).val).toBeCloseTo(94.15)

    checkDependency([r.final.burgeon.q('critRate_')], calc.nodes, {})
  })
})

let lastID = 1
function checkDependency(n: AnyNode[], db: TagMap<AnyNode>, tag: Tag, translation = new TagMap<number>(keys), visiting: Tag[] = [], visitingID = new Set<number>()) {
  const tags = [tag]
  traverse(n, (n, map) => {
    const { op } = n
    switch (op) {
      case 'read': {
        const baseTag = tags[tags.length - 1]
        const tag = { ...baseTag, ...n.tag }

        let id = translation.exact(tag)[0]
        if (id === undefined) {
          id = lastID++
          translation.add(tag, id)
        }

        if (visitingID.has(id)) {
          console.log(visiting, tag)
          throw "Cyclical dependencies found"
        }

        visiting.push(n.tag)
        visitingID.add(id)

        const nodes = db.subset(tag)
        if (!n.agg) {
          if (nodes.length !== 1) {
            console.log(visiting, tag)
            throw "Invalid Non-aggregating Read Found"
          }
        }
        checkDependency(nodes, db, tag, translation, visiting, visitingID)

        visitingID.delete(id)
        visiting.pop()
        return
      }
      case 'tag':
        const tag = n.tag
        tags.push({ ...tags[tags.length - 1], ...tag })
        visiting.push(tag)
        map(n.x[0])
        visiting.pop()
        tags.pop()
        return
    }
    n.x.forEach(x => map(x))
    n.br.forEach(br => map(br))
  })
}

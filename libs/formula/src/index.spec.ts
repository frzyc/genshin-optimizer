import { AnyNode, Calculator, compileTagMapValues, constant, jsonToTagMapValues, ReRead, TagMap, traverse } from "@genshin-optimizer/waverider";
import { keys, preValues } from "./data";
import { Data, Preset, read, reader, Tag } from "./data/util";

const values = jsonToTagMapValues<AnyNode>(preValues)

describe('Genshin Database', () => {
  const data: Data = [], active: Preset[] = ['preset0'], team: Preset[] = ['preset0', 'preset1']

  {
    // Preset 0 <= Nahida + TulaytullahsRemembrance
    const preset = 'preset0', r = reader.withTag({ preset })

    {
      // Preset 0 <= Nahida
      const name = 'Nahida', {
        custom: { a1ActiveInBurst, c2Bloom, c2QSA, c4Count },
        output: {
          selfBuff: { base, char: { lvl, ascension, constellation }, }
        }
      } = read(name, r)
      data.push(
        r.with('src', 'char').reread(r.with('src', name)),

        lvl.addNode(constant(12)),
        ascension.addNode(constant(0)),
        constellation.addNode(constant(2)),
        c2Bloom.addNode(constant('on')),
        base.critRate_.addNode(constant(0.90)),
      )
    }
    {
      // Preset 0 <= TulaytullahsRemembrance
      const name = 'TulaytullahsRemembrance', {
        custom: { timePassive, hitPassive },
        output: { selfBuff: { weapon: { lvl, ascension, refinement } } }
      } = read(name, r)
      data.push(
        r.with('src', 'weapon').reread(r.with('src', name)),

        lvl.addNode(constant(42)),
        ascension.addNode(constant(2)),
        refinement.addNode(constant(2)),
      )
    }
  }
  {
    // Preset 1 <= Nilou + KeyOfKhajNisut
    const preset = 'preset1', r = reader.withTag({ preset })

    {
      // Preset 1 <= Nilou
      const name = 'Nilou', {
        custom: {
          a1AfterSkill, a1AfterHit,
          c2Hydro, c2Dendro, c4AfterPirHit
        },
        output: { selfBuff: { char: { lvl, ascension, constellation }, } }
      } = read('Nilou', r)

      data.push(
        r.with('src', 'char').reread(r.with('src', name)),

        lvl.addNode(constant(33)),
        ascension.addNode(constant(1)),
        constellation.addNode(constant(3)),
      )
    }
    {
      // Preset 1 <= KeyOfKhajNisut
      const name = 'KeyOfKhajNisut', {
        custom: { afterSkillStacks },
        output: { selfBuff: { weapon: { lvl, ascension, refinement } } }
      } = read(name, r)

      data.push(
        r.with('src', 'weapon').reread(r.with('src', name)),

        lvl.addNode(constant(59)),
        ascension.addNode(constant(3)),
        refinement.addNode(constant(3)),
        afterSkillStacks.addNode(constant(3)),
      )
    }
  }

  {
    // Team
    for (const dst of team) {
      const entry = reader.withTag({ preset: dst, et: 'self', src: 'agg' })
      data.push(...team.map(src =>
        entry.reread(reader.withTag({ preset: src, dst, et: 'teamBuff', src: 'agg' }))
      ))
    }
    for (const dst of active) {
      const entry = reader.withTag({ preset: dst, et: 'self', src: 'agg' })
      data.push(...team.map(src =>
        entry.reread(reader.withTag({ preset: src, dst, et: 'active', src: 'agg' }))))
    }
  }

  const compiled = compileTagMapValues<Data[number]['value']>(keys, data)
  const calc = new Calculator(keys, values, compiled)

  const nahida = reader.withTag({ preset: 'preset0', et: 'self', src: 'agg' })
  const nilou = reader.withTag({ preset: 'preset1', et: 'self', src: 'agg' })

  test('Basic Query', () => {
    expect(calc._compute(nilou.final.hp).val.toFixed(1)).toEqual("9479.7")
    expect(calc._compute(nahida.final.atk).val).toBeCloseTo(346.21)
    expect(calc._compute(nahida.final.def).val).toBeCloseTo(94.15)
    expect(calc._compute(nahida.final.eleMas).val).toBeCloseTo(28.44)
    expect(calc._compute(nahida.final.critRate_.burgeon).val).toBeCloseTo(1.10)
    expect(calc._compute(nahida.common.cappedCritRate_).val).toBe(0.90)
    expect(calc._compute(nahida.common.cappedCritRate_.burgeon).val).toBe(1)
  })
})

function dependencyString(tag: Tag, calc: Calculator) {
  const str = listDependencies(tag, calc).map(({ tag, read, reread }) => {
    const result: any = { tag: tagString(tag) }
    if (read.length) result.dep = read.map(tagString)
    if (reread.length) result.re = reread.map(tagString)
    return result
  })
  return str
}
function tagString(tag: Tag): string {
  return `{ ${Object.entries(tag).map(([k, v]) => `${k}:${v}`).join(" ")} }`
}

let lastID = 1
function listDependencies(tag: Tag, calc: Calculator): { tag: Tag, read: Tag[], reread: Tag[] }[] {
  const result: { tag: Tag, read: Tag[], reread: Tag[] }[] = []
  const translation = new TagMap<number>(keys), visited: Set<number> = new Set(), visiting: Tag[] = [], visitingID = new Set<number>()
  function getID(tag: Tag): number {
    let id = translation.exact(tag)[0]
    if (id === undefined) {
      id = lastID++
      translation.add(tag, id)
    }
    return id
  }

  function internal(tag: Tag) {
    const { nodes } = calc.withTag(tag)
    const n = nodes.filter(x => x.op !== 'reread') as AnyNode[]
    const re = nodes.filter(x => x.op === 'reread') as ReRead[]
    const read: Tag[] = [], reread: Tag[] = []
    result.push({ tag, read, reread })

    const id = getID(tag)
    if (visited.has(id)) return
    if (visitingID.has(id)) {
      console.log(visiting, tag)
      throw "Cyclical dependencies found"
    }
    visitingID.add(id)

    const tags = [tag]
    traverse(n, (n, map) => {
      switch (n.op) {
        case 'read': {
          const newTag = { ...tags[tags.length - 1], ...n.tag }
          read.push(newTag)
          internal(newTag)
          return
        }
        case 'tag': {
          tags.push({ ...tags[tags.length - 1], ...n.tag })
          map(n.x[0])
          tags.pop()
          return
        }
      }
      n.x.forEach(map)
      n.br.forEach(map)
    })

    for (const { tag: extra } of re) {
      const newTag = { ...tag, ...extra }
      internal(newTag)
      reread.push(newTag)
    }

    visitingID.delete(id)
    visited.add(id)
  }
  internal(tag)
  return result
}

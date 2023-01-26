import { AnyNode, Calculator, compileTagMapValues, constant, ReRead, TagMapExactValues, TagMapKeys, TagMapSubsetCache, traverse } from '@genshin-optimizer/waverider'
import { keys, values } from './data'
import { Data, Preset, read, reader, Tag } from './data/util'

const tagKeys = new TagMapKeys(keys)

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
        r.with('src', 'agg').reread(r.with('src', name)),

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
        r.with('src', 'agg').reread(r.with('src', name)),

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
        r.with('src', 'agg').reread(r.with('src', name)),

        lvl.addNode(constant(33)),
        ascension.addNode(constant(1)),
        constellation.addNode(constant(3)),
        a1AfterSkill.addNode(constant('off')),
      )
    }
    {
      // Preset 1 <= KeyOfKhajNisut
      const name = 'KeyOfKhajNisut', {
        custom: { afterSkillStacks },
        output: { selfBuff: { weapon: { lvl, ascension, refinement } } }
      } = read(name, r)

      data.push(
        r.with('src', 'agg').reread(r.with('src', name)),

        lvl.addNode(constant(59)),
        ascension.addNode(constant(3)),
        refinement.addNode(constant(3)),
        afterSkillStacks.addNode(constant(3)),
      )
    }
  }

  {
    // Team Buff
    for (const dst of team) {
      const entry = reader.withTag({ preset: dst, et: 'self', src: 'agg' })
      data.push(...team.map(src =>
        entry.reread(reader.withTag({ preset: src, dst, et: 'teamBuff', src: 'agg' }))
      ))
    }
    // Active Member Buff
    for (const dst of active) {
      const entry = reader.withTag({ preset: dst, et: 'self', src: 'agg' })
      data.push(...team.map(src =>
        entry.reread(reader.withTag({ preset: src, dst, et: 'active', src: 'agg' }))))
    }
    // Total Team Stat
    for (const dst of team) {
      const entry = reader.withTag({ preset: dst, et: 'self', src: 'team' })
      data.push(...team.map(src =>
        entry.reread(reader.withTag({ dst: null, preset: src, et: 'self', src: 'agg' }))))
    }
  }

  const compiled = compileTagMapValues<Data[number]['value']>(keys, data)
  const calc = new Calculator(keys, values, compiled)

  const nahida = reader.withTag({ preset: 'preset0', et: 'self', src: 'agg' })
  const nilou = reader.withTag({ preset: 'preset1', et: 'self', src: 'agg' })

  test('Basic Query', () => {
    expect(calc.compute(nilou.final.hp).val).toBeCloseTo(9479.7, 1)
    expect(calc.compute(nahida.final.atk).val).toBeCloseTo(346.21, 2)
    expect(calc.compute(nahida.final.def).val).toBeCloseTo(94.15, 2)
    expect(calc.compute(nahida.final.eleMas).val).toBeCloseTo(28.44, 2)
    expect(calc.compute(nahida.final.critRate_.burgeon).val).toBeCloseTo(1.10, 2)
    expect(calc.compute(nahida.common.cappedCritRate_).val).toBe(0.90)
    expect(calc.compute(nahida.common.cappedCritRate_.burgeon).val).toBe(1)
    expect(calc.compute(nahida.withTag({ src: 'team' }).team.count.dendro).val).toBe(1)
    expect(calc.compute(nahida.withTag({ src: 'team' }).team.count.hydro).val).toBe(1)
    expect(calc.compute(nahida.withTag({ src: 'team' }).team.eleCount).val).toBe(2)
  })
})

function dependencyString(tag: Tag, calc: Calculator) {
  const str = listDependencies(tag, calc).map(({ tag, read, reread }) => {
    const result: any = { tag: tagString(tag) }
    if (read.length || reread.length)
      result.deps = [
        ...read.map(tagString),
        ...reread.map(tagString),
      ]
    return result
  })
  return str
}
function tagString(tag: Tag): string {
  return `${Object.entries(tag).filter(([_, v]) => v).map(([k, v]) => `${k}:${v}`).join(' ')}`
}

function listDependencies(tag: Tag, calc: Calculator): { tag: Tag, read: Tag[], reread: Tag[] }[] {
  const result: { tag: Tag, read: Tag[], reread: Tag[] }[] = [], stack: Tag[] = []
  /** Stack depth when first encountered the tag, or 0 if already visited */
  const openDepth = new TagMapExactValues<number>(keys.tagLen, {})

  function internal(cache: TagMapSubsetCache<AnyNode | ReRead>) {
    const tag = cache.tag, depth = openDepth.refExact(tagKeys.get(tag))
    if (depth[0] > 0) {
      console.log(stack.slice(depth[0] - 1))
      throw new Error('Cyclical dependencies found')
    } else if (depth[0] == 0)
      return // Already visited
    depth[0] = stack.push(tag)

    const nodes = cache.subset(), read: Tag[] = [], reread: Tag[] = []
    const n = nodes.filter(x => x.op !== 'reread') as AnyNode[]
    const re = nodes.filter(x => x.op === 'reread') as ReRead[]
    result.push({ tag, read, reread })

    const tags = [tag]
    traverse(n, (n, map) => {
      switch (n.op) {
        case 'read': {
          const newTag = cache.with(n.tag)
          read.push(newTag.tag)
          internal(newTag)
          return
        }
        case 'tag': {
          tags.push({ ...tags.at(-1), ...n.tag })
          map(n.x[0])
          tags.pop()
          return
        }
      }
      n.x.forEach(map)
      n.br.forEach(map)
    })

    for (const { tag: extra } of re) {
      const newTag = cache.with(extra)
      internal(newTag)
      reread.push(newTag.tag)
    }

    depth[0] = 0
    stack.pop()
  }
  internal(calc.nodes.cache(calc.keys).with(tag))
  return result
}

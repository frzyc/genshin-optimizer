import { AnyNode, compileTagMapValues, ReRead, TagMapExactValues, TagMapKeys, TagMapSubsetCache, traverse } from '@genshin-optimizer/waverider'
import { Calculator, translate } from './calculator'
import { keys, values } from './data'
import { convert, Data, enemyDebuff, Read, reader, selfBuff, selfTag, Tag, userBuff } from './data/util'
import { charData, teamData, weaponData } from './util'

const tagKeys = new TagMapKeys(keys)

describe('Genshin Database', () => {
  const data: Data = [
    // Team
    ...teamData(['member0'], ['member0', 'member1']),

    // Preset 0
    ...charData('member0', {
      name: 'Nahida', lvl: 12, ascension: 0, constellation: 2, custom: {
        a1ActiveInBurst: 'off', c2Bloom: 'on', c2QSA: 'off', c4Count: 'off'
      }
    }),
    ...weaponData('member0', {
      name: 'TulaytullahsRemembrance', lvl: 42, ascension: 2, refinement: 2, custom: {
        timePassive: 0, hitPassive: 0
      }
    }),
    // Preset 1
    ...charData('member1', {
      name: 'Nilou', lvl: 33, ascension: 1, constellation: 3, custom: {
        a1AfterSkill: 'off', a1AfterHit: 'off',
        c2Hydro: 'off', c2Dendro: 'off', c4AfterPirHit: 'off'
      }
    }),
    ...weaponData('member1', {
      name: 'KeyOfKhajNisut', lvl: 59, ascension: 3, refinement: 3, custom: {
        afterSkillStacks: 3
      }
    }),

    // Default char
    userBuff.base.critRate_.withTag({ member: 'member0' }).add(0.05),
    userBuff.base.critDMG_.withTag({ member: 'member0' }).add(0.5),

    // Enemy
    enemyDebuff.cond.cata.add('spread'),
    enemyDebuff.cond.amp.add(''),
    enemyDebuff.common.lvl.add(12),
    enemyDebuff.common.preRes.add(0.10),
    selfBuff.common.critMode.add('avg'),
  ], calc = new Calculator(keys, values, compileTagMapValues<Data[number]['value']>(keys, data))

  const nahida = convert(selfTag, { member: 'member0', et: 'self' })
  const nilou = convert(selfTag, { member: 'member1', et: 'self' })

  // Note: `member` can be any valid member
  const team = convert(selfTag, { member: 'member2', et: 'team' })

  test('Basic Queries', () => {
    expect(calc.compute(nilou.final.hp).val).toBeCloseTo(9479.7, 1)
    expect(calc.compute(nahida.final.atk).val).toBeCloseTo(346.21, 2)
    expect(calc.compute(nahida.final.def).val).toBeCloseTo(94.15, 2)
    expect(calc.compute(nahida.final.eleMas).val).toBeCloseTo(28.44, 2)
    expect(calc.compute(nahida.final.critRate_).val).toBe(0.05)
    expect(calc.compute(nahida.final.critRate_.burgeon).val).toBeCloseTo(0.25, 2)
    expect(calc.compute(nahida.common.cappedCritRate_).val).toBe(0.05)
    expect(calc.compute(nahida.common.cappedCritRate_.burgeon).val).toBe(0.25)
  })
  test('Team queries', () => {
    expect(calc.compute(nahida.common.count.hydro).val).toBe(0)
    expect(calc.compute(nahida.common.count.dendro).val).toBe(1)
    expect(calc.compute(team.common.count.dendro).val).toBe(1)
    expect(calc.compute(team.common.count.hydro).val).toBe(1)

    expect(calc.compute(nahida.common.eleCount).val).toBe(2)

    expect(calc.compute(team.final.eleMas).val).toEqual(
      calc.compute(nahida.final.eleMas).val + calc.compute(nilou.final.eleMas).val)
  })
  test('Final formulas', () => {
    const normal_0 = reader.withTag({ member: 'member0', src: 'prep', prep: 'dmg', nameSrc: 'Nahida' }).name('normal_0')
    const normal_1 = reader.withTag({ member: 'member0', src: 'prep', prep: 'dmg', nameSrc: 'Nahida' }).name('normal_1')

    expect(calc.compute(normal_0).val).toBeCloseTo(91.61, 2)
    expect(calc.compute(normal_1).val).toBeCloseTo(86.23, 2)
  })
})

function dependencyString(read: Read, calc: Calculator) {
  const str = listDependencies(read.tag, calc).map(({ tag, read, reread }) => {
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

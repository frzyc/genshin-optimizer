import { compileTagMapValues } from '@genshin-optimizer/pando'
import { Calculator } from './calculator'
import { data, keys, values } from './data'
import type { Data, Member, Source } from './data/util'
import { allStacks, srcs } from './data/util'
import {} from './debug'
import { teamData } from './util'

describe('calculator', () => {
  describe('correctness', () => {
    describe('team member', () => {
      test('stats', () => {
        throw new Error('Add test')
      })
      test('optimization target', () => {
        throw new Error('Add test')
      })
    })
    describe('team', () => {
      test('stats', () => {
        throw new Error('Add test')
      })
      test('buff', () => {
        throw new Error('Add test')
      })
      test('counter', () => {
        throw new Error('Add test')
      })
      test('optimization target', () => {
        throw new Error('Add test')
      })
    })
    test('custom buff', () => {
      throw new Error('Add test')
    })
    test('stacking', () => {
      // Use existing `q:`
      const { hp: test1, hp_: test2 } = allStacks('CalamityQueller')
      const { hp: test3, hp_: test4 } = allStacks('NoblesseOblige')
      const members: Member[] = ['member0', 'member1', 'member2'],
        data: Data = [
          ...teamData(['member0', 'member2'], members),
          // Multiple members with 1
          test1.in.with('member', 'member1').add(1),
          test1.in.with('member', 'member2').add(1),

          // Multiple members with 1
          test2.in.with('member', 'member2').add(1),
          test2.in.with('member', 'member3').add(1),

          // One member with 1
          test3.in.with('member', 'member0').add(1),
        ],
        calc = new Calculator(keys, values, compileTagMapValues(keys, data))

      // Exactly one member gets `1` if some members have `stack.in` set to `1`
      expect(
        members
          .map((member) => calc.compute(test1.out.withTag({ member })).val)
          .sort()
      ).toEqual([0, 0, 1])
      expect(
        members
          .map((member) => calc.compute(test2.out.withTag({ member })).val)
          .sort()
      ).toEqual([0, 0, 1])
      expect(
        members
          .map((member) => calc.compute(test3.out.withTag({ member })).val)
          .sort()
      ).toEqual([0, 0, 1])
      // Every member gets `0` if `stack.in` is `0`
      expect(
        members
          .map((member) => calc.compute(test4.out.withTag({ member })).val)
          .sort()
      ).toEqual([0, 0, 0])
    })
    test('name uniqueness', () => {
      const entries = Object.fromEntries(
        srcs.map((src) => [src, new Set()])
      ) as Record<Source, Set<string>>
      for (const { tag, value } of data)
        if (tag.qt === 'formula' && tag.q === 'listing') {
          // `name` has a specific structure; it must be the top `tag` in the entry
          const src = tag.src!,
            name = (value.op === 'tag' && value.tag['name']) || tag.name!

          expect(src).toBeTruthy()
          expect(name).toBeTruthy()

          // Listing entry
          if (entries[src].has(name))
            throw new Error(`Duplicated formula names ${src}:${name}`)
          entries[src].add(name)
        }
    })
  })
})

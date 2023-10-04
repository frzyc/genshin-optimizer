import { compileTagMapValues } from '@genshin-optimizer/pando'
import { Calculator } from './calculator'
import { entries, keys, values } from './data'
import type { Member, Source, TagMapNodeEntries } from './data/util'
import { allStacks, srcs, tag } from './data/util'
import { teamData, withMember } from './util'

import {} from './debug'

describe('calculator', () => {
  describe('correctness', () => {
    describe.skip('team member', () => {
      test('stats', () => {
        throw new Error('Add test')
      })
      test('optimization target', () => {
        throw new Error('Add test')
      })
    })
    describe.skip('team', () => {
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
    test.skip('custom buff', () => {
      throw new Error('Add test')
    })
    test('stacking', () => {
      // Use existing `q:`
      const { hp: test1, hp_: test2 } = allStacks('CalamityQueller')
      const { hp: test3, hp_: test4 } = allStacks('NoblesseOblige')
      const members: Member[] = ['member0', 'member1', 'member2'],
        data: TagMapNodeEntries = [
          ...teamData(['member0', 'member2'], members),
          // Multiple members with 1
          ...withMember('member1', test1.add(1)),
          ...withMember('member2', test1.add(1)),

          // Multiple members with 1
          ...withMember('member2', test2.add(1)),
          ...withMember('member3', test2.add(1)),

          // One member with 1
          ...withMember('member0', test3.add(1)),
        ],
        calc = new Calculator(keys, values, compileTagMapValues(keys, data))

      // Exactly one member gets `val` if some members have `stack.in` set to `1`
      expect(
        members
          .map((member) => calc.compute(tag(test1.apply(3, 5), { member })).val)
          .sort()
      ).toEqual([3, 5, 5])
      expect(
        members
          .map((member) => calc.compute(tag(test2.apply(1), { member })).val)
          .sort()
      ).toEqual([0, 0, 1])
      expect(
        members
          .map((member) => calc.compute(tag(test3.apply(1), { member })).val)
          .sort()
      ).toEqual([0, 0, 1])
      // Every member gets `0` if `stack.in` is `0`
      expect(
        members
          .map((member) => calc.compute(tag(test4.apply(1), { member })).val)
          .sort()
      ).toEqual([0, 0, 0])
    })
    test('name uniqueness', () => {
      const namesBySrc = Object.fromEntries(
        srcs.map((src) => [src, new Set()])
      ) as Record<Source, Set<string>>
      for (const { tag, value } of entries)
        if (tag.qt === 'formula' && tag.q === 'listing') {
          // `name` has a specific structure; it must be the top `tag` in the entry
          const src = tag.src!,
            name = (value.op === 'tag' && value.tag['name']) || tag.name!

          if (value.tag?.['qt'] === 'base' || value.tag?.['qt'] === 'premod')
            continue // stat listing

          expect(src).toBeTruthy()
          expect(name).toBeTruthy()

          // Listing entry
          if (namesBySrc[src].has(name))
            throw new Error(`Duplicated formula names ${src}:${name}`)
          namesBySrc[src].add(name)
        }
    })
  })
})

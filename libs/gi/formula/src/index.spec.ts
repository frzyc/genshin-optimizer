import { compileTagMapValues } from '@genshin-optimizer/pando/engine'
import { Calculator } from './calculator'
import { entries, keys, values } from './data'
import type { Member, Source, TagMapNodeEntries } from './data/util'
import { hiddenEntries, self, srcs, teamBuff } from './data/util'
import { teamData, withMember } from './util'

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
      const members: Member[] = ['member0', 'member1', 'member2'],
        // Use existing `q:hp` and `q:def` for stacking key
        data: TagMapNodeEntries = [
          ...teamData(['member0', 'member2'], members),
          // Multiple members with non-zero values
          ...withMember('member0', self.premod.hp.add(5)),
          ...withMember('member1', self.premod.hp.add(3)),
          ...withMember('member2', self.premod.hp.add(3)),
          teamBuff.final.atk.addOnce(self.premod.hp, 'max', 'hp'),

          // No member with value
          teamBuff.final.def.addOnce(self.premod.eleMas, 'max', 'def'),

          // This is normally added during sheet finalization,
          // but for a test, we add them much later here
          ...hiddenEntries.slice(-2),
        ],
        calc = new Calculator(keys, values, compileTagMapValues(keys, data))

      // Every member got buffed by exactly once with the highest value
      for (const member of members) {
        expect(calc.compute(self.final.atk.withTag({ member })).val).toEqual(5)
        expect(calc.compute(self.final.def.withTag({ member })).val).toEqual(0)
      }
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

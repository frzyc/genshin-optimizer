import { compileTagMapValues } from '@genshin-optimizer/pando/engine'
import { Calculator } from './calculator'
import { entries, keys, values } from './data'
import type { Member, Sheet, TagMapNodeEntries } from './data/util'
import { self, selfBuff, selfTag, sheets, tagStr, teamBuff } from './data/util'
import { teamData, withMember } from './util'

import { allCharacterKeys, allWeaponKeys } from '@genshin-optimizer/gi/consts'
import { fail } from 'assert'

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
    describe('stacking', () => {
      const members: Member[] = ['0', '1', '2', '3']
      const stack = teamBuff.final.atk.addOnce('static', self.premod.hp)
      test('multiple non-zero entries', () => {
        const data: TagMapNodeEntries = [
            ...teamData(members),
            // Multiple members with non-zero values
            ...withMember('0', selfBuff.premod.hp.add(5)),
            ...withMember('1', selfBuff.premod.hp.add(3)),
            ...withMember('2', selfBuff.premod.hp.add(4)),
            ...stack,
          ],
          calc = new Calculator(keys, values, compileTagMapValues(keys, data))

        // Every member got buffed by exactly once with the last member value
        for (const src of members)
          expect(calc.compute(self.final.atk.withTag({ src })).val).toEqual(4)
      })
      test('no non-zero entries', () => {
        const data: TagMapNodeEntries = [
            ...teamData(members),
            // No members with non-zero values
            ...stack,
          ],
          calc = new Calculator(keys, values, compileTagMapValues(keys, data))
        for (const src of members)
          expect(calc.compute(self.final.atk.withTag({ src })).val).toEqual(0)
      })
    })
  })
})
describe('sheet', () => {
  test('buff entries', () => {
    const sheets = new Set([...allCharacterKeys, ...allWeaponKeys, 'art'])
    for (const { tag } of entries) {
      if (tag.et && tag.qt && tag.q) {
        switch (tag.et) {
          case 'notSelfBuff':
          case 'teamBuff': {
            const { sheet } = (selfTag as any)[tag.qt][tag.q]
            if (sheet === 'agg' && sheets.has(tag.sheet as any)) continue
            fail(`Ill-form ${tag.et} entry (${tagStr(tag)}) for sheet ${sheet}`)
            break
          }
          case 'self': {
            const desc = (selfTag as any)[tag.qt]?.[tag.q]
            if (!desc) continue
            const { sheet } = desc
            if (!sheet) continue
            if (sheet === 'iso' || sheet === 'agg' || sheet === tag.sheet)
              continue
            fail(`Illform self entry (${tagStr(tag)}) for sheet ${sheet}`)
          }
        }
      }
    }
  })
  test('name uniqueness', () => {
    const namesBySheet = Object.fromEntries(
      sheets.map((s) => [s, new Set()])
    ) as Record<Sheet, Set<string>>
    for (const { tag, value } of entries)
      if (tag.qt === 'formula' && tag.q === 'listing') {
        // `name` has a specific structure; it must be the top `tag` in the entry
        const s = tag.sheet!,
          name = (value.op === 'tag' && value.tag['name']) || tag.name!

        if (value.tag?.['qt'] === 'base' || value.tag?.['qt'] === 'premod')
          continue // stat listing

        expect(s).toBeTruthy()
        expect(name).toBeTruthy()

        // Listing entry
        if (namesBySheet[s].has(name))
          throw new Error(`Duplicated formula names ${s}:${name}`)
        namesBySheet[s].add(name)
      }
  })
})

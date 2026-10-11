import { usedNames, usedQ } from '@genshin-optimizer/game-opt/engine'
import type { ICharacter, IWeapon } from '@genshin-optimizer/gi/good'
import {
  compileTagMapKeys,
  compileTagMapValues,
  prod,
  setDebugMode,
} from '@genshin-optimizer/pando/engine'
import { Calculator } from './calculator'
import { entries } from './data'
import type { Member, TagMapNodeEntries } from './data/util'
import {
  conditionalEntries,
  fixedTags,
  own,
  queryTypes,
  stackListingNulls,
  stackReadTag,
  stackToken,
  teamBuff,
} from './data/util'
import rawData from './example.test.json'
import { genshinCalculatorWithEntries } from './index'
import {
  charData,
  conditionalData,
  teamData,
  weaponData,
  withMember,
} from './util'

setDebugMode(true)

/** Recompile after test-time `addOnce` / `stackToken` so debug `q` lookups exist. */
function compileKeys() {
  return compileTagMapKeys([
    { category: 'qt', values: queryTypes },
    { category: 'q', values: usedQ },
    undefined,
    ...Object.entries(fixedTags).map(([k, v]) => ({
      category: k,
      values: new Set(v),
    })),
    { category: 'name', values: usedNames },
  ])
}

describe('stackReadTag', () => {
  test('pins listing cats to null', () => {
    expect(stackReadTag('key', 'stackIn', '0')).toMatchObject({
      et: 'own',
      sheet: 'key',
      qt: 'stackIn',
      q: '0',
      ...stackListingNulls,
    })
    expect(stackReadTag('nightweaver', 'stackOut')).toMatchObject({
      et: 'own',
      sheet: 'nightweaver',
      qt: 'stackOut',
      name: null,
      ele: null,
      move: null,
    })
  })
})

describe('addOnce listing cats', () => {
  const members: Member[] = ['0', '1']
  const stack = teamBuff.final.eleMas.addOnce('static', 10)
  const testKeys = compileKeys()
  const testValues = compileTagMapValues(testKeys, entries)
  const calcWith = (data: TagMapNodeEntries) =>
    new Calculator(testKeys, testValues, compileTagMapValues(testKeys, data))

  test('listing ele/move tags still see the stacked value', () => {
    const data: TagMapNodeEntries = [
      ...teamData(members),
      ...withMember('0', ...stack),
      ...withMember('1', ...stack),
    ]
    const calc = calcWith(data)
    const listing = own.final.eleMas.withTag({
      src: '0',
      move: 'normal',
      ele: 'dendro',
      amp: '',
      cata: 'spread',
      name: 'normal_0',
    })
    expect(calc.compute(own.final.eleMas.withTag({ src: '0' })).val).toBe(10)
    expect(calc.compute(listing).val).toBe(10)
    expect(calc.compute(own.final.eleMas.withTag({ src: '1' })).val).toBe(10)
  })

  test('last non-zero member wins once', () => {
    const data: TagMapNodeEntries = [
      ...teamData(members),
      ...withMember('0', ...teamBuff.final.eleMas.addOnce('static', 3)),
      ...withMember('1', ...teamBuff.final.eleMas.addOnce('static', 7)),
    ]
    const calc = calcWith(data)
    const listing = own.final.eleMas.withTag({
      src: '0',
      move: 'normal',
      ele: 'dendro',
    })
    expect(calc.compute(listing).val).toBe(7)
    expect(calc.compute(own.final.eleMas.withTag({ src: '1' })).val).toBe(7)
  })
})

describe('stackToken packet', () => {
  const members: Member[] = ['0', '1']
  const on = stackToken('static', 1)
  const off = stackToken('static', 0)
  const testKeys = compileKeys()
  const testValues = compileTagMapValues(testKeys, entries)
  const calcWith = (data: TagMapNodeEntries) =>
    new Calculator(testKeys, testValues, compileTagMapValues(testKeys, data))

  test('one winner supplies every dest', () => {
    const data: TagMapNodeEntries = [
      ...teamData(members),
      ...withMember(
        '0',
        ...on.entries,
        teamBuff.premod.dmg_.bloom.add(prod(on.out, 1.2)),
        teamBuff.premod.dmg_.lunarbloom.add(prod(on.out, 0.1))
      ),
      ...withMember(
        '1',
        ...on.entries,
        teamBuff.premod.dmg_.bloom.add(prod(on.out, 0.5)),
        teamBuff.premod.dmg_.lunarbloom.add(prod(on.out, 0.4))
      ),
    ]
    const calc = calcWith(data).withTag({ src: '0' })
    expect(calc.compute(own.premod.dmg_.bloom).val).toBe(0.5)
    expect(calc.compute(own.premod.dmg_.lunarbloom).val).toBe(0.4)
    expect(
      calc
        .withTag({ src: '1' })
        .compute(
          own.premod.dmg_.bloom.withTag({ move: 'skill', ele: 'dendro' })
        ).val
    ).toBe(0.5)
  })

  test('zero token contributes nothing', () => {
    const data: TagMapNodeEntries = [
      ...teamData(['0']),
      ...withMember(
        '0',
        ...off.entries,
        teamBuff.premod.dmg_.bloom.add(prod(off.out, 1.2))
      ),
    ]
    const calc = calcWith(data).withTag({ src: '0' })
    expect(calc.compute(own.premod.dmg_.bloom).val).toBe(0)
  })
})

describe('Khaj addOnce under listing tags', () => {
  test('example listing still includes team EM', () => {
    const data: TagMapNodeEntries = [
      ...teamData(['0', '1']),
      ...withMember(
        '0',
        ...charData(rawData[0].char as ICharacter),
        ...weaponData(rawData[0].weapon as IWeapon)
      ),
      ...withMember(
        '1',
        ...charData(rawData[1].char as ICharacter),
        ...weaponData(rawData[1].weapon as IWeapon)
      ),
      ...conditionalData('0', rawData[0].conditionals),
      ...conditionalData('1', rawData[1].conditionals),
      conditionalEntries('KeyOfKhajNisut', '1', null)('afterSkillStacks', 3),
    ]
    const calc = genshinCalculatorWithEntries(data)
    const mem0 = calc.withTag({ src: '0' })
    expect(mem0.compute(own.final.eleMas).val).toBeCloseTo(28.44, 2)
    expect(
      mem0.compute(
        own.final.eleMas.withTag({
          move: 'normal',
          ele: 'dendro',
          cata: 'spread',
        })
      ).val
    ).toBeCloseTo(28.44, 2)
  })
})

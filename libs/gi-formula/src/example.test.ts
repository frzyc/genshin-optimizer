import { allArtifactSetKeys } from '@genshin-optimizer/consts'
import type { ICharacter, IWeapon } from '@genshin-optimizer/gi-good'
import {
  combineConst,
  compile,
  compileTagMapValues,
  detach,
  flatten,
} from '@genshin-optimizer/pando'
import { Calculator } from './calculator'
import { keys, values } from './data'
import type { Tag, TagMapNodeEntries } from './data/util'
import {
  convert,
  enemyDebuff,
  selfBuff,
  selfTag,
  team,
  userBuff,
} from './data/util'
import { DebugCalculator } from './debug'
import rawData from './example.test.json'
import {
  artifactsData,
  charData,
  conditionalData,
  teamData,
  weaponData,
  withMember,
} from './util'

// This test acts as an example usage. It's mostly sufficient to test that the code
// doesn't crash. Any test for correct values should go to `correctness` tests.
// Should a test here fail, extract a minimized version to `correctness` test.
describe('example', () => {
  const data: TagMapNodeEntries = [
      ...teamData(['member0'], ['member0', 'member1']),

      ...withMember(
        'member0',
        ...charData(rawData[0].char as ICharacter),
        ...weaponData(rawData[0].weapon as IWeapon),
        ...artifactsData([
          /* per art stat */
        ]),
        ...conditionalData(rawData[0].conditionals),

        // custom buff
        userBuff.premod.def.add(30)
      ),
      ...withMember(
        'member1',
        ...charData(rawData[1].char as ICharacter),
        ...weaponData(rawData[1].weapon as IWeapon),
        ...artifactsData([
          /* per art stat */
        ]),
        ...conditionalData(rawData[1].conditionals)
      ),

      // Enemy
      enemyDebuff.cond.cata.add('spread'),
      enemyDebuff.cond.amp.add(''),
      enemyDebuff.common.lvl.add(12),
      enemyDebuff.common.preRes.add(0.1),
      selfBuff.common.critMode.add('avg'),
    ],
    calc = new Calculator(keys, values, compileTagMapValues(keys, data))

  const member0 = convert(selfTag, { member: 'member0', et: 'self' })
  const member1 = convert(selfTag, { member: 'member1', et: 'self' })

  test('enumerate all tags', () => {
    expect(Object.keys(member0).sort()).toEqual(Object.keys(selfTag).sort())
    for (const [qt, values] of Object.entries(member0)) {
      expect(values).toBe(member0[qt as keyof typeof member0])
      for (const [q, v] of Object.entries(values)) {
        // Swap order here to check if the order of query matters
        expect(values[q as keyof typeof values]).toBe(v)
      }
    }
  })
  test('calculate stats', () => {
    expect(calc.compute(member1.final.hp).val).toBeCloseTo(9479.7, 1)
    expect(calc.compute(member0.final.atk).val).toBeCloseTo(346.21, 2)
    expect(calc.compute(member0.final.def).val).toBeCloseTo(124.15, 2)
    expect(calc.compute(member0.final.eleMas).val).toBeCloseTo(28.44, 2)
    expect(calc.compute(member0.final.critRate_).val).toBe(0.05)
    expect(calc.compute(member0.final.critRate_.burgeon).val).toBeCloseTo(
      0.25,
      2
    )
    expect(calc.compute(member0.common.cappedCritRate_).val).toBe(0.05)
    expect(calc.compute(member0.common.cappedCritRate_.burgeon).val).toBe(0.25)
  })
  test('calculate team stats', () => {
    // Nahida's contribution to `common.count`
    expect(calc.compute(member0.common.count.hydro).val).toBe(0)
    expect(calc.compute(member0.common.count.dendro).val).toBe(1)

    // Team's final `common.count`
    expect(calc.compute(team.common.count.dendro).val).toBe(1)
    expect(calc.compute(team.common.count.hydro).val).toBe(1)
    // NOT `team` since this uses a specific formula, but the value from every member is the same
    expect(calc.compute(member0.common.eleCount).val).toBe(2)

    expect(calc.compute(team.final.eleMas).val).toEqual(
      calc.compute(member0.final.eleMas).val +
        calc.compute(member1.final.eleMas).val
    )
  })
  describe('list final formulas', () => {
    /**
     * Each entry in listing is a `Tag` in the shape of
     * ```
     * {
     *   member: 'member'
     *   et: 'self'
     *   src: <sheet that defines the formula>
     *   qt: 'formula'
     *   q: < 'dmg' / 'trans' / 'shield' / 'heal' >
     *   name: <formula name>
     * }
     * ```
     */
    const listing = calc.listFormulas(member0.formula.listing).map((x) => x.tag)

    // Simple check that all tags are in the correct format
    const names: string[] = []
    for (const { name, move, ...tag } of listing.filter(
      (x) => x.src === 'Nahida' && x.qt == 'formula' // exclude stats
    )) {
      names.push(name!)
      expect(name).toBeTruthy()
      expect(move).toBeTruthy()
      test(`with name ${name}`, () => {
        expect(tag).toEqual({
          member: 'member0',
          et: 'self',
          src: 'Nahida',
          qt: 'formula',
          q: 'dmg', // DMG formula
        })
      })
    }
    expect(names.sort()).toEqual([
      'charged',
      'karma_dmg',
      'normal_0',
      'normal_1',
      'normal_2',
      'normal_3',
      'plunging_dmg',
      'plunging_high',
      'plunging_low',
      'skill_hold',
      'skill_press',
    ])
    expect(listing.filter((x) => x.src === 'static').length).toEqual(5)
  })
  test('calculate final formulas', () => {
    const read = calc
      .listFormulas(member0.formula.listing)
      .find((x) => x.tag.name === 'normal_0')!
    const tag = read.tag

    expect(read).toBeTruthy()
    expect(tag.src).toEqual('Nahida') // Formula from Nahida
    expect(tag.q).toEqual('dmg') // DMG formula
    expect(tag.name).toEqual('normal_0') // Formula name

    // Compute formula
    const { val, meta } = calc.compute(read)
    const { amp, move, ele, cata } = meta.tag!

    // Calculation result, reaction, element, etc
    expect(val).toBeCloseTo(91.61, 2)
    expect(amp).toEqual('')
    expect(move).toEqual('normal')
    expect(ele).toEqual('dendro')
    expect(cata).toEqual('spread')
  })
  test('list conditionals affecting a given node', () => {
    const result = calc.compute(member0.dmg.critMulti.burgeon)
    const conds = result.meta.conds

    expect(conds.length).toEqual(2)
    expect(conds[0]).toEqual({
      et: 'self',
      member: 'member0',
      trans: 'burgeon',
      dst: 'member0',
      src: 'Nahida',
      qt: 'cond',
      q: 'c2Bloom',
    })
    // It is duplicated because this conditional affects two distinct
    // stats, `critRate_` and `critDMG_`. Deduplicating this requires
    // tag equality, which may not be worth it.
    expect(conds[1]).toEqual(conds[0])
  })
  test('create optimization calculation', () => {
    // Step 1: Pick formula(s); anything that `calc.compute` can handle will work
    const nodes = [
      calc
        .listFormulas(member0.formula.listing)
        .find((x) => x.tag.name === 'normal_0')!,
      member0.char.auto,
      member0.final.atk,
    ]

    // Step 2: Detach nodes from Calculator
    const allArts = new Set(allArtifactSetKeys) // Cache for fast lookup, put in global
    let detached = detach(nodes, calc, (tag: Tag) => {
      if (tag['member'] != 'member0') return undefined // Wrong member
      if (tag['et'] != 'self') return undefined // Not applied (only) to self

      if (tag['src'] === 'dyn' && tag['qt'] === 'premod')
        return { q: tag['q']! } // Art stat bonus
      if (tag['q'] === 'count' && allArts.has(tag['src'] as any))
        return { q: tag['src']! } // Art set counter
      return undefined
    })

    // Step 3: Optimize nodes, as needed
    detached = flatten(detached)
    detached = combineConst(detached)

    // Step 4: Compile for quick iteration
    const compiled = compile(
      detached,
      'q', // Tag category for object key
      2, // Number of slots
      {}, // Initial values
      // Header; includes custom formulas, such as `res`
      `function res(res) {
      if (res < 0) return 1 - res / 2
      else if (res >= 0.75) return 1 / (res * 4 + 1)
      return 1 - res
    }`
    )

    // Step 5: Calculate the value
    compiled([{ atk: 10 }, { atk_: 0.5 }])
  })

  test.skip('debug formula', () => {
    // Pick formula
    const normal0 = calc
      .listFormulas(member1.formula.listing)
      .find((x) => x.tag.name === 'normal_0')!

    // Use `DebugCalculator` instead of `Calculator`, same constructor
    const debugCalc = new DebugCalculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    )

    // Print calculation steps
    console.log(debugCalc.debug(normal0))
  })
})

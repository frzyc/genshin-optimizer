import { allArtifactSetKeys } from '@genshin-optimizer/gi/consts'
import type { ICharacter, IWeapon } from '@genshin-optimizer/gi/good'
import {
  compile,
  compileTagMapValues,
  detach,
  setDebugMode,
  simplify,
} from '@genshin-optimizer/pando/engine'
import { entries, keys, values } from './data'
import type { Tag, TagMapNodeEntries } from './data/util'
import { enemyDebuff, own, ownBuff, team, userBuff } from './data/util'
import rawData from './example.test.json'
import { genshinCalculatorWithEntries } from './index'
import { conditionals } from './meta'
import {
  artifactsData,
  charData,
  conditionalData,
  teamData,
  weaponData,
  withMember,
} from './util'

setDebugMode(true)
// This is generally unnecessary, but without it, some tags in `DebugCalculator` will be missing
Object.assign(values, compileTagMapValues(keys, entries))

// This test acts as an example usage. It's mostly sufficient to test that the code
// doesn't crash. Any test for correct values should go to `correctness` tests.
// Should a test here fail, extract a minimized version to `correctness` test.
describe('example', () => {
  const data: TagMapNodeEntries = [
      ...teamData(['0', '1']),

      ...withMember(
        '0',
        ...charData(rawData[0].char as ICharacter),
        ...weaponData(rawData[0].weapon as IWeapon),
        ...artifactsData([
          /* per art stat */
        ]),

        // custom buff
        userBuff.premod.def.add(30)
      ),
      ...withMember(
        '1',
        ...charData(rawData[1].char as ICharacter),
        ...weaponData(rawData[1].weapon as IWeapon),
        ...artifactsData([
          /* per art stat */
        ])
      ),

      // Conditionals
      ...conditionalData('0', rawData[0].conditionals),
      ...conditionalData('1', rawData[1].conditionals),

      // Enemy
      enemyDebuff.reaction.cata.add('spread'),
      enemyDebuff.reaction.amp.add(''),
      enemyDebuff.common.lvl.add(12),
      enemyDebuff.common.preRes.add(0.1),
      ownBuff.common.critMode.add('avg'),
    ],
    calc = genshinCalculatorWithEntries(data)

  const mem0 = calc.withTag({ src: '0' })
  const mem1 = calc.withTag({ src: '1' })

  test.skip('debug formula', () => {
    // Pick formula
    const normal0 = mem1
      .listFormulas(own.listing.formulas)
      .find((x) => x.tag.name === 'normal_0')!

    // Get a debug calculator
    const debugCalc = calc.toDebug()

    // Print calculation steps
    console.log(JSON.stringify(debugCalc.compute(normal0)))
  })

  test('calculate stats', () => {
    expect(mem1.compute(own.final.hp).val).toBeCloseTo(9479.7, 1)
    expect(mem0.compute(own.final.atk).val).toBeCloseTo(346.21, 2)
    expect(mem0.compute(own.final.def).val).toBeCloseTo(124.15, 2)
    expect(mem0.compute(own.final.eleMas).val).toBeCloseTo(28.44, 2)
    expect(mem0.compute(own.final.critRate_).val).toBe(0.05)
    expect(mem0.compute(own.final.critRate_.burgeon).val).toBeCloseTo(0.25, 2)
    expect(mem0.compute(own.common.cappedCritRate_).val).toBe(0.05)
    expect(mem0.compute(own.common.cappedCritRate_.burgeon).val).toBe(0.25)
    const specialized = mem0.compute(own.char.specialized)
    expect(specialized.val).toBe(0)
    // Specialized stat include the stat tag
    expect(specialized.meta.tag?.['sheet']).toBe('Nahida')
    expect(specialized.meta.tag!['qt']).toBe('premod')
    expect(specialized.meta.tag!['q']).toBe('eleMas')
  })
  test('calculate team stats', () => {
    // Nahida's contribution to `common.count`
    expect(mem0.compute(own.common.count.hydro).val).toBe(0)
    expect(mem0.compute(own.common.count.dendro).val).toBe(1)

    // Team's final `common.count`
    expect(calc.compute(team.common.count.dendro).val).toBe(1)
    expect(calc.compute(team.common.count.hydro).val).toBe(1)
    // Team stats are accessible via `mem*` as well
    expect(mem0.compute(team.common.count.dendro).val).toBe(1)
    expect(mem0.compute(team.common.count.hydro).val).toBe(1)
    // NOT `team` since this uses a specific formula, but the value from every member is the same
    expect(mem0.compute(own.common.eleCount).val).toBe(2)

    expect(calc.compute(team.final.eleMas.sum).val).toEqual(
      mem0.compute(own.final.eleMas).val + mem1.compute(own.final.eleMas).val
    )
  })
  describe('retrieve formulas in a listing', () => {
    /**
     * Each entry in listing is a `Tag` in the shape of
     * ```
     * {
     *   src: <member>
     *   et: 'own'
     *   sheet: <sheet that defines the formula>
     *   qt: 'formula'
     *   q: < 'dmg' / 'trans' / 'shield' / 'heal' >
     *   name: <formula name>
     * }
     * ```
     */
    const listing = mem0.listFormulas(own.listing.formulas).map((x) => x.tag)

    // Simple check that all tags are in the correct format
    const names: string[] = []
    for (const { name, move, ...tag } of listing.filter(
      (x) => x.sheet === 'Nahida' && x.qt == 'formula' // exclude stats
    )) {
      names.push(name!)
      expect(name).toBeTruthy()
      expect(move).toBeTruthy()
      test(`with name ${name}`, () => {
        expect(tag).toEqual({
          src: '0',
          et: 'own',
          sheet: 'Nahida',
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
    expect(listing.filter((x) => x.sheet === 'static').length).toEqual(6)
  })
  test('calculate formulas in a listing', () => {
    const read = mem0
      .listFormulas(own.listing.formulas)
      .find((x) => x.tag.name === 'normal_0')!
    const tag = read.tag

    expect(read).toBeTruthy()
    expect(tag.sheet).toEqual('Nahida') // Formula from Nahida
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
    const result = mem0.compute(own.dmg.critMulti.burgeon)
    const conds = result.meta.conds

    // conds[dst][src][sheet][name] == cond value
    expect(conds).toEqual({ 0: { 0: { Nahida: { c2Bloom: 1 } } } })
  })
  test('list conditionals affecting a member', () => {
    // all conditionals affecting all formulas
    const conds = mem0.listCondFormulas(own.listing.formulas)

    // Read current value: all -> member0 Nilou:a1AfterHit
    expect(conds['0']?.['1']?.['Nilou']?.['a1AfterHit']).toEqual(0)

    // Grab metadata from an entry
    const meta = conditionals.Nilou.a1AfterHit
    expect(meta).toEqual({ sheet: 'Nilou', name: 'a1AfterHit', type: 'bool' })
  })
  test('create optimization calculation', () => {
    // Step 1: Pick formula(s); anything that `calc.compute` can handle will work
    const nodes = [
      mem0
        .listFormulas(own.listing.formulas)
        .find((x) => x.tag.name === 'normal_0')!,
      own.char.auto,
      own.final.atk,
    ]

    // Step 2: Detach nodes from Calculator
    const allArts = new Set(allArtifactSetKeys) // Cache for fast lookup, put in global
    let detached = detach(nodes, calc, (tag: Tag) => {
      if (tag['src'] != '0') return undefined // Wrong member
      if (tag['et'] != 'own') return undefined // Not applied (only) to 'own'

      if (tag['sheet'] === 'dyn' && tag['qt'] === 'premod')
        return { q: tag['q']! } // Art stat bonus
      if (tag['q'] === 'count' && allArts.has(tag['sheet'] as any))
        return { q: tag['sheet']! } // Art set counter
      return undefined
    })

    // Step 3: Optimize nodes, as needed
    detached = simplify(detached)

    // Step 4: Compile for quick iteration
    const compiled = compile(
      detached,
      'q', // Tag category for object key
      2, // Number of slots
      {} // Initial values
    )

    // Step 5: Calculate the value
    compiled([{ atk: 10 }, { atk_: 0.5 }])
  })
})
describe('weapon-only example', () => {
  const data: TagMapNodeEntries = [...weaponData(rawData[1].weapon as IWeapon)],
    calc = genshinCalculatorWithEntries(data)

  test('calculate specialized stats', () => {
    const primary = calc.compute(own.weapon.primary)
    expect(primary.val).toBeCloseTo(337.96) // atk
    expect(primary.meta.tag?.['sheet']).toEqual('KeyOfKhajNisut')
    expect(primary.meta.tag!['qt']).toEqual('base')
    expect(primary.meta.tag!['q']).toEqual('atk')

    // If there are multiple, or none, use `calc.get` instead
    const secondary = calc.compute(own.weapon.secondary)
    expect(secondary.val).toBeCloseTo(0.458) // hp_
    expect(secondary.meta.tag?.['sheet']).toEqual('KeyOfKhajNisut')
    expect(secondary.meta.tag!['qt']).toEqual('premod')
    expect(secondary.meta.tag!['q']).toEqual('hp_')
  })
})

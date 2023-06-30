import { allArtifactSetKeys } from '@genshin-optimizer/consts'
import {
  ReRead,
  TagMapSubsetValues,
  compile,
  compileTagMapValues,
  constant,
  detach,
  flatten,
  read,
  reread,
  transform,
} from '@genshin-optimizer/waverider'
import { Calculator } from './calculator'
import { keys, values } from './data'
import type { Data } from './data/util'
import {
  convert,
  enemyDebuff,
  reader,
  selfBuff,
  selfTag,
  team,
  userBuff,
} from './data/util'
import {} from './debug'
import {
  artifactsData,
  charData,
  teamData,
  weaponData,
  withMember,
} from './util'

// This test acts as an example usage. It's mostly sufficient to test that the code
// doesn't crash. Any test for correct values should go to `correctness` tests.
// Should a test here fail, extract a minimized version to `correctness` test.
describe('example', () => {
  const data: Data = [
      ...teamData(['member0'], ['member0', 'member1']),

      ...withMember(
        'member0',
        ...charData({
          name: 'Nahida',
          lvl: 12,
          tlvl: { auto: 0, skill: 0, burst: 0 },
          ascension: 0,
          constellation: 2,
          conds: {
            a1ActiveInBurst: 'off',
            c2Bloom: 'on',
            c2QSA: 'off',
            c4Count: 'off',
          },
        }),
        ...weaponData({
          name: 'TulaytullahsRemembrance',
          lvl: 42,
          ascension: 2,
          refinement: 2,
          conds: {
            timePassive: 0,
            hitPassive: 0,
          },
        }),
        ...artifactsData(
          [
            /* per art stat */
          ],
          {
            /* conditionals */
          }
        ),

        // custom buff
        userBuff.premod.def.add(30)
      ),
      ...withMember(
        'member1',
        ...charData({
          name: 'Nilou',
          lvl: 33,
          tlvl: { auto: 0, skill: 0, burst: 0 },
          ascension: 1,
          constellation: 3,
          conds: {
            a1AfterSkill: 'off',
            a1AfterHit: 'off',
            c2Hydro: 'off',
            c2Dendro: 'off',
            c4AfterPirHit: 'off',
          },
        }),
        ...weaponData({
          name: 'KeyOfKhajNisut',
          lvl: 59,
          ascension: 3,
          refinement: 3,
          conds: {
            afterSkillStacks: 3,
          },
        }),
        ...artifactsData(
          [
            /* per art stat */
          ],
          {
            /* conditionals */
          }
        )
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
    const listing = calc.listFormulas({ member: 'member0' })

    // Simple check that all tags are in the correct format
    const names: string[] = []
    for (const { name, move, ...tag } of listing.filter(
      (x) => x.src === 'Nahida'
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
    const tag = calc
      .listFormulas({ member: 'member0' })
      .find((x) => x.name === 'normal_0')!
    expect(tag).toBeTruthy()
    expect(tag.src).toEqual('Nahida') // Formula from Nahida
    expect(tag.q).toEqual('dmg') // DMG formula
    expect(tag.name).toEqual('normal_0') // Formula name

    // Compute formula
    const { val, meta } = calc.compute(reader.withTag(tag))
    const { amp, move, ele, cata } = meta.tag!

    // Calculation result, reaction, element, etc
    expect(val).toBeCloseTo(91.61, 2)
    expect(amp).toEqual('')
    expect(move).toEqual('normal')
    expect(ele).toEqual('dendro')
    expect(cata).toEqual('spread')
  })
  test('list conditionals affecting a given node', () => {
    const result = calc.compute(member0.common.cappedCritRate_.burgeon)
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
    // Step 0: One-time setup DB dynamic tags; can be shared across compilations
    const dynTagData = compileTagMapValues<ReRead>(keys, [
      {
        // All premod art stats from 'self' at the first member
        tag: { et: 'self', src: 'art', qt: 'premod', member: 'member0' },
        value: reread({}),
      },
      {
        // CAUTION:
        // If this includes too many unrelated entries, we may have to include `src:`
        // Art set counter
        tag: { q: 'count', member: 'member0' },
        value: reread({}),
      },
    ])
    const dynTags = new TagMapSubsetValues(keys.tagLen, dynTagData)

    // Step 1: Pick formula(s), anything that `calc.compute` can handle will work
    const nodes = [
      read(
        calc
          .listFormulas({ member: 'member0' })
          .find((x) => x.name === 'normal_0')!,
        undefined
      ),
      member0.char.auto,
      member0.final.atk,
    ]

    // Step 2: Detach nodes from Calculator
    let detached = detach(nodes, calc, dynTags)

    // Step 3: Optimize nodes, as needed

    // Step 3.1: Reset `Read.tag` and put relevant field in `q:`
    const allArts = new Set(allArtifactSetKeys) // Cache for fast lookup, put in global
    detached = transform(detached, (n, map) => {
      if (n.op !== 'read') {
        const x = n.x.map(map)
        const br = n.br.map(map)
        return { ...n, x, br } as (typeof detached)[number]
      }

      const {
        tag: { src, q },
      } = n
      if (q !== 'count') return read({ q }, undefined) // Art bonus stat
      if (allArts.has(src as any)) return read({ q: src }, undefined) // Art count

      // Unrelated entries, may be useful to track these entries
      return constant(0)
    })
    // Step 3.2: General optimization
    detached = flatten(detached)

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
})

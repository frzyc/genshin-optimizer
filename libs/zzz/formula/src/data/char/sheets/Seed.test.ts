import { compileTagMapValues } from '@genshin-optimizer/pando/engine'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { describe, expect, it } from 'vitest'
import { charTagMapNodeEntries, teamData, withMember } from '../../..'
import { Calculator } from '../../../calculator'
import { data, keys, values } from '../..'
import {
  conditionalEntries,
  convert,
  ownTag,
  userBuff,
  type TagMapNodeEntries,
} from '../../util'

Object.assign(values, compileTagMapValues(keys, data))

const dm = mappedStats.char.Seed
const CORE = 6
const vanguardAtk = dm.core.direct_strike_atk[CORE]

type CharKey = 'Harumasa' | 'Seed' | 'Soldier11' | 'AstraYao'

function baseChar(key: CharKey, mindscape = 0) {
  return {
    key,
    level: 60,
    promotion: 5,
    basic: 12,
    dodge: 12,
    special: 12,
    assist: 12,
    chain: 12,
    core: CORE,
    mindscape,
    potential: 0,
  }
}

function ownOf(src: CharKey) {
  return convert(ownTag, { et: 'own', src, dst: src })
}

function calcWith(
  members: CharKey[],
  conditionals: TagMapNodeEntries = [],
  bonusInitialAtk: Partial<Record<CharKey, number>> = {}
) {
  const entries: TagMapNodeEntries = [
    ...teamData(members),
    ...members.flatMap((key) =>
      withMember(
        key,
        ...charTagMapNodeEntries(baseChar(key)),
        // userBuff (sheet:custom) is visible on member* reads used by Vanguard checks;
        // raw ownBuff.initial.atk.add is not.
        ...(bonusInitialAtk[key]
          ? [userBuff.initial.atk.add(bonusInitialAtk[key]!)]
          : [])
      )
    ),
    ...conditionals,
  ]
  return new Calculator(keys, values, compileTagMapValues(keys, entries))
}

const directStrikeOn = () =>
  conditionalEntries('Seed', 'Seed', null)('directStrike', 1)

describe('Seed Vanguard Direct Strike', () => {
  it('buffs the sole Attack teammate even if Seed has higher initial ATK', () => {
    const calc = calcWith(
      ['Harumasa', 'Seed', 'AstraYao'],
      [directStrikeOn()],
      { Seed: 5000, Harumasa: 100 }
    )
    expect(calc.compute(ownOf('Harumasa').combat.atk).val).toBeCloseTo(
      vanguardAtk
    )
    expect(calc.compute(ownOf('Seed').combat.atk).val).toBe(0)
    expect(calc.compute(ownOf('AstraYao').combat.atk).val).toBe(0)
  })

  it('buffs only the highest-initial-ATK Attack teammate when there are two', () => {
    const calc = calcWith(
      ['Harumasa', 'Seed', 'Soldier11'],
      [directStrikeOn()],
      { Seed: 8000, Harumasa: 2000, Soldier11: 500 }
    )
    expect(calc.compute(ownOf('Harumasa').combat.atk).val).toBeCloseTo(
      vanguardAtk
    )
    expect(calc.compute(ownOf('Soldier11').combat.atk).val).toBe(0)
    expect(calc.compute(ownOf('Seed').combat.atk).val).toBe(0)
  })

  it('switches Vanguard when the other Attack teammate has higher initial ATK', () => {
    const calc = calcWith(
      ['Harumasa', 'Seed', 'Soldier11'],
      [directStrikeOn()],
      { Seed: 8000, Harumasa: 500, Soldier11: 2000 }
    )
    expect(calc.compute(ownOf('Soldier11').combat.atk).val).toBeCloseTo(
      vanguardAtk
    )
    expect(calc.compute(ownOf('Harumasa').combat.atk).val).toBe(0)
  })
})

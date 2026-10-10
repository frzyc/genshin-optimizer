import type {
  ArtifactSetKey,
  CharacterKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import type { ICharacter, IWeapon } from '@genshin-optimizer/gi/good'
import {
  conditionalEntries,
  enemy,
  hexereiTally,
  own,
  team,
  userBuff,
} from './data/util'
import { genshinCalculatorWithEntries } from './index'
import {
  artifactsData,
  charData,
  pandoContextEntries,
  teamData,
  weaponData,
  withMember,
} from './util'

function char(key: CharacterKey): ICharacter {
  return {
    key,
    level: 80,
    talent: { auto: 8, skill: 8, burst: 8 },
    ascension: 6,
    constellation: 0,
  }
}

function weapon(key: WeaponKey): IWeapon {
  return {
    key,
    level: 90,
    ascension: 6,
    refinement: 1,
    location: '',
    lock: false,
  }
}

function artSet(set: ArtifactSetKey, n: number) {
  return artifactsData(Array.from({ length: n }, () => ({ set, stats: [] })))
}

describe('unique enemy shred', () => {
  test('two Deepwood 4pc shred once', () => {
    const calc = genshinCalculatorWithEntries([
      ...teamData(['0', '1']),
      ...withMember(
        '0',
        ...charData(char('Nahida')),
        ...weaponData(weapon('SacrificialFragments')),
        ...artSet('DeepwoodMemories', 4)
      ),
      ...withMember(
        '1',
        ...charData(char('Collei')),
        ...weaponData(weapon('FavoniusWarbow')),
        ...artSet('DeepwoodMemories', 4)
      ),
      conditionalEntries('DeepwoodMemories', '0', null)('set4', 1),
      conditionalEntries('DeepwoodMemories', '1', null)('set4', 1),
    ])
    expect(calc.compute(enemy.common.preRes.dendro).val).toBeCloseTo(-0.3)
  })

  test('two VV same-ele shred once; different eles both apply', () => {
    const same = genshinCalculatorWithEntries([
      ...teamData(['0', '1']),
      ...withMember(
        '0',
        ...charData(char('Venti')),
        ...weaponData(weapon('FavoniusWarbow')),
        ...artSet('ViridescentVenerer', 4)
      ),
      ...withMember(
        '1',
        ...charData(char('Sucrose')),
        ...weaponData(weapon('SacrificialFragments')),
        ...artSet('ViridescentVenerer', 4)
      ),
      conditionalEntries('ViridescentVenerer', '0', null)('swirlpyro', 1),
      conditionalEntries('ViridescentVenerer', '1', null)('swirlpyro', 1),
    ])
    expect(same.compute(enemy.common.preRes.pyro).val).toBeCloseTo(-0.4)

    const split = genshinCalculatorWithEntries([
      ...teamData(['0', '1']),
      ...withMember(
        '0',
        ...charData(char('Venti')),
        ...weaponData(weapon('FavoniusWarbow')),
        ...artSet('ViridescentVenerer', 4)
      ),
      ...withMember(
        '1',
        ...charData(char('Sucrose')),
        ...weaponData(weapon('SacrificialFragments')),
        ...artSet('ViridescentVenerer', 4)
      ),
      conditionalEntries('ViridescentVenerer', '0', null)('swirlpyro', 1),
      conditionalEntries('ViridescentVenerer', '1', null)('swirlhydro', 1),
    ])
    expect(split.compute(enemy.common.preRes.pyro).val).toBeCloseTo(-0.4)
    expect(split.compute(enemy.common.preRes.hydro).val).toBeCloseTo(-0.4)
  })
})

describe('Petra ap4 packet', () => {
  test('one winner supplies every absorb ele', () => {
    const calc = genshinCalculatorWithEntries([
      ...teamData(['0', '1']),
      ...withMember(
        '0',
        ...charData(char('Noelle')),
        ...weaponData(weapon('FavoniusGreatsword')),
        ...artSet('ArchaicPetra', 4)
      ),
      ...withMember(
        '1',
        ...charData(char('Ningguang')),
        ...weaponData(weapon('FavoniusCodex')),
        ...artSet('ArchaicPetra', 4)
      ),
      // absorbableEle: hydro=1, pyro=2
      conditionalEntries('ArchaicPetra', '0', null)('element', 1),
      conditionalEntries('ArchaicPetra', '1', null)('element', 2),
    ])
    const mem0 = calc.withTag({ src: '0' })
    expect(mem0.compute(own.final.dmg_.hydro).val).toBeCloseTo(0)
    expect(mem0.compute(own.final.dmg_.pyro).val).toBeCloseTo(0.35)
  })
})

describe('CelestialGift hymn ORs active.charEle', () => {
  test('off-field hydro wearer hymns the on-fielder geo', () => {
    const calc = genshinCalculatorWithEntries([
      ...teamData(['0', '1']),
      ...pandoContextEntries({ memberKeys: ['0', '1'], activeMember: '1' }),
      ...withMember(
        '0',
        ...charData(char('Barbara')),
        ...weaponData(weapon('ThrillingTalesOfDragonSlayers')),
        ...artSet('CelestialGift', 4),
        hexereiTally(2)
      ),
      ...withMember(
        '1',
        ...charData(char('Noelle')),
        ...weaponData(weapon('FavoniusGreatsword'))
      ),
      conditionalEntries('CelestialGift', '0', null)('set4', 1),
    ])
    const mem0 = calc.withTag({ src: '0' })
    expect(calc.compute(team.common.activeEle.geo).val).toBe(1)
    expect(mem0.compute(own.final.dmg_.hydro).val).toBeCloseTo(0.6)
    expect(mem0.compute(own.final.dmg_.geo).val).toBeCloseTo(0.4)
  })
})

describe('Evenstar off-field share', () => {
  function evenstarCalc(activeMember: '0' | '1') {
    return genshinCalculatorWithEntries([
      ...teamData(['0', '1']),
      ...pandoContextEntries({ memberKeys: ['0', '1'], activeMember }),
      ...withMember(
        '0',
        ...charData(char('Noelle')),
        ...weaponData(weapon('FavoniusGreatsword'))
      ),
      ...withMember(
        '1',
        ...charData(char('Barbara')),
        ...weaponData(weapon('WanderingEvenstar')),
        userBuff.premod.eleMas.add(1000)
      ),
    ])
  }

  test('share applies to wielder and teammate only while off-field', () => {
    const off = evenstarCalc('0')
    const on = evenstarCalc('1')
    const teammateOff = off.withTag({ src: '0' }).compute(own.final.atk).val
    const teammateOn = on.withTag({ src: '0' }).compute(own.final.atk).val
    const wielderOff = off.withTag({ src: '1' }).compute(own.final.atk).val
    const wielderOn = on.withTag({ src: '1' }).compute(own.final.atk).val
    expect(teammateOff).toBeGreaterThan(teammateOn + 50)
    expect(wielderOff).toBeGreaterThan(wielderOn + 50)
  })
})

describe('Athame dest polarity', () => {
  function athameCalc(activeMember: '0' | '1') {
    return genshinCalculatorWithEntries([
      ...teamData(['0', '1']),
      ...pandoContextEntries({ memberKeys: ['0', '1'], activeMember }),
      ...withMember(
        '0',
        ...charData(char('Noelle')),
        ...weaponData(weapon('FavoniusGreatsword'))
      ),
      ...withMember(
        '1',
        ...charData(char('Jean')),
        ...weaponData(weapon('AthameArtis'))
      ),
      conditionalEntries('AthameArtis', '1', null)('burstHit', 1),
    ])
  }

  test('off-field wielder buffs only the on-fielder', () => {
    const off = athameCalc('0')
    const on = athameCalc('1')
    const destOff = off.withTag({ src: '0' })
    const destOn = on.withTag({ src: '0' })
    expect(destOff.compute(own.premod.atk_).val).toBeCloseTo(0.16)
    expect(destOn.compute(own.premod.atk_).val).toBeCloseTo(0)
    expect(off.withTag({ src: '1' }).compute(own.premod.atk_).val).toBeCloseTo(
      0.2
    )
  })
})

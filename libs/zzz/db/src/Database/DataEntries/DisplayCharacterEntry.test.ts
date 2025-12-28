import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allAttributeKeys,
  allCharacterRarityKeys,
  allSpecialityKeys,
} from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'
import { characterSortKeys } from './DisplayCharacterEntry'

describe('DisplayCharacterEntry', () => {
  let database: ZzzDatabase
  let displayChar: ZzzDatabase['displayCharacter']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    displayChar = database.displayCharacter
  })

  it('should validate complete DisplayCharacterEntry', () => {
    const valid = {
      sortType: 'level' as const,
      ascending: false,
      specialtyType: [...allSpecialityKeys],
      attribute: [...allAttributeKeys],
      rarity: [...allCharacterRarityKeys],
    }
    const result = displayChar['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.sortType).toBe('level')
  })

  it('should disallow "new" as sortType (business rule)', () => {
    const invalid = {
      sortType: 'new',
      ascending: false,
      specialtyType: [...allSpecialityKeys],
      attribute: [...allAttributeKeys],
      rarity: [...allCharacterRarityKeys],
    }
    const result = displayChar['validate'](invalid)
    expect(result?.sortType).toBe('level')
  })

  it('should validate all allowed sortType values', () => {
    characterSortKeys
      .filter((k) => k !== 'new')
      .forEach((sortKey) => {
        const valid = {
          sortType: sortKey,
          ascending: false,
          specialtyType: [...allSpecialityKeys],
          attribute: [...allAttributeKeys],
          rarity: [...allCharacterRarityKeys],
        }
        const result = displayChar['validate'](valid)
        expect(result?.sortType).toBe(sortKey)
      })
  })

  it('should filter invalid specialtyType values', () => {
    const invalid = {
      sortType: 'level' as const,
      ascending: false,
      specialtyType: [allSpecialityKeys[0], 'INVALID', allSpecialityKeys[1]],
      attribute: [...allAttributeKeys],
      rarity: [...allCharacterRarityKeys],
    }
    const result = displayChar['validate'](invalid)
    expect(result?.specialtyType).toEqual([
      allSpecialityKeys[0],
      allSpecialityKeys[1],
    ])
  })

  it('should preserve empty arrays', () => {
    const withEmpty = {
      sortType: 'level' as const,
      ascending: false,
      specialtyType: [],
      attribute: [],
      rarity: [],
    }
    const result = displayChar['validate'](withEmpty)
    expect(result?.specialtyType).toEqual([])
    expect(result?.attribute).toEqual([])
    expect(result?.rarity).toEqual([])
  })
})

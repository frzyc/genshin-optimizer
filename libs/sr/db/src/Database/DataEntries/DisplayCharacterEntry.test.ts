import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allElementalTypeKeys,
  allPathKeys,
  allRarityKeys,
} from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'
import { characterSortKeys } from './DisplayCharacterEntry'

describe('DisplayCharacterEntry.validate', () => {
  let database: SroDatabase
  let displayChar: SroDatabase['displayCharacter']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    displayChar = database.displayCharacter
  })

  it('should validate complete DisplayCharacterEntry', () => {
    const valid = {
      sortType: 'level' as const,
      ascending: false,
      path: [...allPathKeys],
      elementalType: [...allElementalTypeKeys],
      rarity: [...allRarityKeys],
    }
    const result = displayChar['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.sortType).toBe('level')
    expect(result?.ascending).toBe(false)
  })

  it('should disallow "new" as sortType (business rule)', () => {
    const invalid = {
      sortType: 'new',
      ascending: false,
      path: [...allPathKeys],
      elementalType: [...allElementalTypeKeys],
      rarity: [...allRarityKeys],
    }
    const result = displayChar['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.sortType).toBe('level')
  })

  it('should validate all allowed sortType values', () => {
    characterSortKeys
      .filter((k) => k !== 'new')
      .forEach((sortKey) => {
        const valid = {
          sortType: sortKey,
          ascending: false,
          path: [...allPathKeys],
          elementalType: [...allElementalTypeKeys],
          rarity: [...allRarityKeys],
        }
        const result = displayChar['validate'](valid)
        expect(result).toBeDefined()
        expect(result?.sortType).toBe(sortKey)
      })
  })

  it('should filter invalid path values', () => {
    const invalid = {
      sortType: 'level' as const,
      ascending: false,
      path: [allPathKeys[0], 'INVALID', allPathKeys[1]],
      elementalType: [...allElementalTypeKeys],
      rarity: [...allRarityKeys],
    }
    const result = displayChar['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.path).toEqual([allPathKeys[0], allPathKeys[1]])
  })
})

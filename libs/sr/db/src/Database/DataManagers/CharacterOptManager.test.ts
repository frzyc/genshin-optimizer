import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'

describe('CharacterOptManager.validate', () => {
  let database: SroDatabase
  let charOpts: SroDatabase['charOpts']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    charOpts = database.charOpts
  })

  it('should validate minimal CharOpt', () => {
    const valid = {
      target: { sheet: 'char' as const, name: 'atk' },
      conditionals: [],
      bonusStats: [],
      statConstraints: [],
    }
    const result = charOpts['validate'](valid, allCharacterKeys[0])
    expect(result).toBeDefined()
    expect(result?.conditionals).toEqual([])
  })

  it('should return undefined for non-object types', () => {
    expect(charOpts['validate'](null, allCharacterKeys[0])).toBeUndefined()
  })

  it('should apply default conditionals if not array', () => {
    const invalid = {
      target: { sheet: 'char' as const, name: 'atk' },
      conditionals: 'not an array' as any,
      bonusStats: [],
      statConstraints: [],
    }
    const result = charOpts['validate'](invalid, allCharacterKeys[0])
    expect(result).toBeDefined()
    expect(result?.conditionals).toEqual([])
  })

  it('should apply default bonusStats if not array', () => {
    const invalid = {
      target: { sheet: 'char' as const, name: 'atk' },
      conditionals: [],
      bonusStats: 'not an array' as any,
      statConstraints: [],
    }
    const result = charOpts['validate'](invalid, allCharacterKeys[0])
    expect(result).toBeDefined()
    expect(result?.bonusStats).toEqual([])
  })

  it('should apply default statConstraints if not array', () => {
    const invalid = {
      target: { sheet: 'char' as const, name: 'atk' },
      conditionals: [],
      bonusStats: [],
      statConstraints: 'not an array' as any,
    }
    const result = charOpts['validate'](invalid, allCharacterKeys[0])
    expect(result).toBeDefined()
    expect(result?.statConstraints).toEqual([])
  })

  it('should remove invalid optConfigId', () => {
    const invalid = {
      target: { sheet: 'char' as const, name: 'atk' },
      conditionals: [],
      bonusStats: [],
      statConstraints: [],
      optConfigId: 'INVALID_ID',
    }
    const result = charOpts['validate'](invalid, allCharacterKeys[0])
    expect(result).toBeDefined()
    expect(result?.optConfigId).toBeUndefined()
  })
})

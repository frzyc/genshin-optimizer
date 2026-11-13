import { DBLocalStorage } from '@genshin-optimizer/common/database'
import type { InputPremodKey } from '@genshin-optimizer/gi/wr-types'
import { ArtCharDatabase } from '../ArtCharDatabase'
import { getEnabledBonusStats } from './TeamCharacterDataManager'

describe('TeamCharacterDataManager', () => {
  const dbStorage = new DBLocalStorage(localStorage)
  const dbIndex = 1
  let database = new ArtCharDatabase(dbIndex, dbStorage)

  beforeEach(() => {
    dbStorage.clear()
    database = new ArtCharDatabase(dbIndex, dbStorage)
  })

  describe('disabledBonusStats', () => {
    test('defaults to no disabled bonus stats', () => {
      const id = database.teamChars.new('HuTao', {
        bonusStats: { atk: 100, critRate_: 10 },
      })
      expect(database.teamChars.get(id)?.disabledBonusStats).toEqual([])
    })

    test('keeps disabled bonus stats that exist in bonusStats', () => {
      const id = database.teamChars.new('HuTao', {
        bonusStats: { atk: 100, critRate_: 10 },
        disabledBonusStats: ['critRate_'],
      })
      expect(database.teamChars.get(id)?.disabledBonusStats).toEqual([
        'critRate_',
      ])
    })

    test('removes unknown and duplicate entries', () => {
      const id = database.teamChars.new('HuTao', {
        bonusStats: { atk: 100, critRate_: 10 },
        disabledBonusStats: [
          'critRate_',
          'critRate_',
          'hp',
          'toString' as InputPremodKey,
          'atk',
        ],
      })
      expect(database.teamChars.get(id)?.disabledBonusStats).toEqual([
        'critRate_',
        'atk',
      ])
    })

    test('falls back to an empty list for malformed data', () => {
      const id = database.teamChars.new('HuTao', {
        bonusStats: { atk: 100 },
        disabledBonusStats: 'atk' as any,
      })
      expect(database.teamChars.get(id)?.disabledBonusStats).toEqual([])
    })

    test('drops the toggle when the bonus stat is removed', () => {
      const id = database.teamChars.new('HuTao', {
        bonusStats: { atk: 100, critRate_: 10 },
        disabledBonusStats: ['critRate_'],
      })
      database.teamChars.set(id, { bonusStats: { atk: 100 } })
      expect(database.teamChars.get(id)?.disabledBonusStats).toEqual([])

      // Re-adding the stat later should not bring back the old toggle
      database.teamChars.set(id, { bonusStats: { atk: 100, critRate_: 10 } })
      expect(database.teamChars.get(id)?.disabledBonusStats).toEqual([])
    })

    test('is kept when exporting and importing a loadout', () => {
      const id = database.teamChars.new('HuTao', {
        bonusStats: { atk: 100, critRate_: 10 },
        disabledBonusStats: ['critRate_'],
      })
      const exported = database.teamChars.export(id, {
        convertEquipped: false,
        convertbuilds: [],
        convertTcBuilds: [],
        exportCustomMultiTarget: [],
      })
      const importedId = database.teamChars.import(exported)
      expect(database.teamChars.get(importedId)?.disabledBonusStats).toEqual([
        'critRate_',
      ])
    })
  })

  describe('getEnabledBonusStats', () => {
    test('returns all bonus stats when none are disabled', () => {
      const bonusStats = { atk: 100, critRate_: 10 }
      expect(
        getEnabledBonusStats({ bonusStats, disabledBonusStats: [] })
      ).toEqual(bonusStats)
    })

    test('leaves out disabled bonus stats', () => {
      expect(
        getEnabledBonusStats({
          bonusStats: { atk: 100, critRate_: 10, enerRech_: 20 },
          disabledBonusStats: ['critRate_', 'enerRech_'],
        })
      ).toEqual({ atk: 100 })
    })
  })
})

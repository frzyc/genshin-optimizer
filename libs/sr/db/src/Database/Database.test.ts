import {
  DBLocalStorage,
  SandboxStorage,
} from '@genshin-optimizer/common/database'
import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import type {
  ILightCone,
  IRelic,
  ISrObjectDescription,
} from '@genshin-optimizer/sr/srod'
import { randomizeRelic } from '@genshin-optimizer/sr/util'
import type { ICachedLightCone, ISroDatabase } from '../Interfaces'
import { SroSource } from '../Interfaces'
import { initialCharacter } from './DataManagers/CharacterDataManager'
import { SroDatabase } from './Database'

const dbStorage = new DBLocalStorage(localStorage, 'sro')
const dbIndex = 1
let database = new SroDatabase(dbIndex, dbStorage)

function newLightCone(key: LightConeKey): ICachedLightCone {
  return {
    key,
    level: 1,
    ascension: 0,
    superimpose: 1,
    location: '',
    lock: false,
    id: '',
  }
}

describe('Database', () => {
  beforeEach(() => {
    dbStorage.clear()
    database = new SroDatabase(dbIndex, dbStorage)
  })

  test('Support roundtrip import-export', () => {
    const march7th = initialCharacter('March7th'),
      tingyun = initialCharacter('Tingyun')
    const march7thLightCone = newLightCone('TrendOfTheUniversalMarket'),
      tingyunLightCone = newLightCone('Chorus')

    const relic1 = randomizeRelic({ slotKey: 'body' }),
      relic2 = randomizeRelic()
    march7th.basic = 4
    relic1.location = 'March7th'
    march7thLightCone.location = 'March7th'

    database.chars.set(march7th.key, march7th)
    database.chars.set(tingyun.key, tingyun)

    database.lightCones.new(march7thLightCone)
    const tingyunLightConeid = database.lightCones.new(tingyunLightCone)

    database.relics.new(relic1)
    const relic2id = database.relics.new(relic2)
    database.relics.set(relic2id, { location: 'Tingyun' })
    database.lightCones.set(tingyunLightConeid, { location: 'Tingyun' })

    const newDB = new SroDatabase(dbIndex, new SandboxStorage(undefined, 'sro'))
    const srod = database.exportSROD()
    newDB.importSROD(srod, false, false)
    expect(
      database.storage.entries.filter(
        ([k]) =>
          k.startsWith('sro_lightCone_') ||
          k.startsWith('sro_character_') ||
          k.startsWith('sro_relic_')
      )
    ).toEqual(
      newDB.storage.entries.filter(
        ([k]) =>
          k.startsWith('sro_lightCone_') ||
          k.startsWith('sro_character_') ||
          k.startsWith('sro_relic_')
      )
    )
    expect(database.chars.values).toEqual(newDB.chars.values)
    expect(database.lightCones.values).toEqual(newDB.lightCones.values)
    expect(database.relics.values).toEqual(newDB.relics.values)
    // Can't check IcharacterCache because equipped can have differing id
  })

  test('Does not crash from invalid storage', () => {
    function tryStorage(
      setup: (storage: Storage) => void,
      verify: (storage: Storage) => void = () => null
    ) {
      localStorage.clear()
      setup(localStorage)
      new SroDatabase(dbIndex, dbStorage)
      verify(localStorage)
    }

    tryStorage(
      (storage) => {
        storage['sro_character_x'] = '{ test: "test" }'
        storage['sro_relic_x'] = '{}'
      },
      (storage) => {
        expect(storage.getItem('sro_character_x')).toBeNull()
      }
    )
    tryStorage(
      (storage) => {
        storage['sro_character_x'] = '{ test: "test" }'
        storage['sro_relic_x'] = '{}'
        expect(storage.getItem('sro_character_x')).not.toBeNull()
      },
      (storage) => {
        expect(storage.getItem('sro_character_x')).toBeNull()
        expect(storage.getItem('sro_relic_x')).toBeNull()
      }
    )
  })

  test('Equip swap', () => {
    database.chars.set('March7th', initialCharacter('March7th'))
    database.lightCones.new({
      ...newLightCone('TrendOfTheUniversalMarket'),
      location: 'March7th',
    })

    const relic1 = randomizeRelic({ slotKey: 'body' })
    relic1.location = 'March7th'
    const relic1id = database.relics.new(relic1)
    expect(database.chars.get('March7th')!.equippedRelics.body).toEqual(
      relic1id
    )
    const relic2 = randomizeRelic({ slotKey: 'body' })
    relic2.location = 'March7th'
    const relic2id = database.relics.new(relic2)
    expect(database.chars.get('March7th')!.equippedRelics.body).toEqual(
      relic2id
    )
    expect(database.relics.get(relic1id)?.location).toEqual('')

    database.chars.set('Gepard', initialCharacter('Gepard'))
    const chorusId = database.lightCones.new(newLightCone('WeAreWildfire'))
    database.lightCones.set(chorusId, { location: 'Gepard' })
    expect(database.chars.get('Gepard')!.equippedLightCone).toEqual(chorusId)
    database.relics.set(relic1id, { location: 'Gepard' })
    expect(database.chars.get('Gepard')!.equippedRelics.body).toEqual(relic1id)

    database.relics.set(relic2id, { location: 'Gepard' })
    expect(database.chars.get('March7th')!.equippedRelics.body).toEqual(
      relic1id
    )
    expect(database.chars.get('Gepard')!.equippedRelics.body).toEqual(relic2id)
    expect(database.relics.get(relic1id)!.location).toEqual('March7th')
  })

  test('can remove equipped lightCone', () => {
    database.chars.set('March7th', initialCharacter('March7th'))
    const sword1 = database.lightCones.new({
      ...newLightCone('TrendOfTheUniversalMarket'),
      location: 'March7th',
    })
    database.lightCones.remove(sword1)
    expect(database.lightCones.get(sword1)).toBeFalsy()
    expect(database.chars.get('March7th')!.equippedLightCone).toEqual('')
  })

  test('Remove relic with equipment', () => {
    database.chars.set('March7th', initialCharacter('March7th'))
    const relic1id = database.relics.new({
      ...randomizeRelic({ slotKey: 'body' }),
      location: 'March7th',
    })
    expect(database.chars.get('March7th')!.equippedRelics.body).toEqual(
      relic1id
    )
    expect(database.relics.get(relic1id)?.location).toEqual('March7th')
    database.relics.remove(relic1id)
    expect(database.chars.get('March7th')!.equippedRelics.body).toEqual('')
    expect(database.relics.get(relic1id)).toBeUndefined()
  })

  test('Test import with initials', () => {
    // When adding relics with equipment, expect character/lightCones to be created
    const relic1 = randomizeRelic({ slotKey: 'body', location: 'March7th' }),
      relic2 = randomizeRelic({ location: 'Tingyun' })

    const tingyunLightCone = newLightCone('Chorus')
    tingyunLightCone.location = 'Tingyun'

    const srod: ISrObjectDescription = {
      format: 'SROD',
      version: 1,
      source: 'Scanner',
      relics: [relic1, relic2],
      lightCones: [tingyunLightCone],
    }
    const importResult = database.importSROD(
      srod as ISrObjectDescription & ISroDatabase,
      false,
      false
    )
    expect(importResult.characters?.new?.length).toEqual(2)
    expect(importResult.relics.invalid.length).toEqual(0)
    expect(importResult.relics?.new?.length).toEqual(2)
    expect(importResult.lightCones?.new?.length).toEqual(1)
  })

  test('Test import with no equip', () => {
    // When adding relics with equipment, expect character/lightCones to be created
    const relic1 = randomizeRelic({ slotKey: 'body', location: 'Tingyun' })

    // Implicitly assign location
    const id = database.relics.new(relic1)

    expect(database.chars.get('Tingyun')!.equippedRelics.body).toEqual(id)

    const srod: ISrObjectDescription = {
      format: 'SROD',
      version: 1,
      source: 'Scanner',
      relics: [relic1],
    }

    // Import the new relic, with no location. this should respect current equipment
    database.importSROD(
      srod as ISrObjectDescription & ISroDatabase,
      false,
      false
    )
    expect(database.chars.get('Tingyun')?.equippedRelics.body).toEqual(id)
  })

  test('Test partial merge', () => {
    // Add Character and Relic
    const march7th = initialCharacter('March7th')
    const march7thLightCone = newLightCone('TrendOfTheUniversalMarket')
    march7thLightCone.location = 'March7th'

    const relic1 = randomizeRelic({
      slotKey: 'body',
      setKey: 'GuardOfWutheringSnow',
      location: 'March7th',
    })

    database.chars.set(march7th.key, march7th)
    const lightConeid = database.lightCones.new(march7thLightCone)
    database.lightCones.set(lightConeid, march7thLightCone)

    const relic1id = database.relics.new(relic1)
    expect(database.chars.get('March7th')?.equippedRelics.body).toEqual(
      relic1id
    )
    expect(database.chars.get('March7th')?.equippedLightCone).toEqual(
      lightConeid
    )
    const srod1: ISrObjectDescription = {
      format: 'SROD',
      version: 1,
      source: 'Scanner',
      relics: [
        randomizeRelic({ slotKey: 'body', setKey: 'BandOfSizzlingThunder' }),
        randomizeRelic({
          slotKey: 'body',
          setKey: 'BandOfSizzlingThunder',
          location: 'March7th',
        }),
      ],
      lightCones: [{ ...newLightCone('WeAreWildfire'), location: 'March7th' }],
    }
    const importResult = database.importSROD(
      srod1 as ISrObjectDescription & ISroDatabase,
      true,
      false
    )
    expect(importResult.relics.new.length).toEqual(2)
    expect(importResult.lightCones.new.length).toEqual(1)
    expect(importResult.characters.new.length).toEqual(0)

    const relics = database.relics.values
    expect(relics.length).toEqual(3)
    expect(
      database.relics.values.reduce(
        (t, relic) => t + (relic.location === 'March7th' ? 1 : 0),
        0
      )
    ).toEqual(1)
    const bodyId = database.chars.get('March7th')?.equippedRelics.body
    expect(bodyId).toBeTruthy()
    expect(database.relics.get(bodyId)?.setKey).toEqual('BandOfSizzlingThunder')
    expect(
      database.lightCones.get(database.chars.get('March7th')?.equippedLightCone)
        ?.key
    ).toEqual('WeAreWildfire')
  })

  test('should merge scanner with dups for lightCones', () => {
    const a1 = newLightCone('Adversarial')
    const a2old = newLightCone('Chorus')
    const a2new = newLightCone('Chorus')
    a2new.level = 20
    const a3 = newLightCone('MakeTheWorldClamor') // in db but not in import
    const a4 = newLightCone('ASecretVow') // in import but not in db

    const dupId = database.lightCones.new(a1)
    const upgradeId = database.lightCones.new(a2old)
    database.lightCones.new(a3)
    const srod1: ISrObjectDescription = {
      format: 'SROD',
      version: 1,
      source: 'Scanner',
      lightCones: [a1, a2new, a4],
    }
    const importResult = database.importSROD(
      srod1 as ISrObjectDescription & ISroDatabase,
      true,
      false
    )
    expect(importResult.lightCones.upgraded.length).toEqual(1)
    expect(importResult.lightCones.unchanged.length).toEqual(1)
    expect(importResult.lightCones.notInImport).toEqual(1)
    expect(importResult.lightCones.new.length).toEqual(1)
    expect(database.lightCones.values.length).toEqual(4)
    const dbA1 = database.lightCones.get(dupId)
    expect(dbA1?.key).toEqual('Adversarial')
    const dbA2 = database.lightCones.get(upgradeId)
    expect(dbA2?.key).toEqual('Chorus')
    expect(dbA2?.level).toEqual(20)
  })

  test('should merge scanner with dups for relics', () => {
    const a1 = randomizeRelic({
      setKey: 'EagleOfTwilightLine',
      slotKey: 'head',
    }) // dup
    const a2old: IRelic = {
      // before
      level: 0,
      location: '',
      lock: false,
      mainStatKey: 'atk',
      rarity: 3,
      setKey: 'BandOfSizzlingThunder',
      slotKey: 'hands',
      substats: [{ key: 'atk_', value: 5 }],
    }
    const a2new: IRelic = {
      // upgrade
      level: 4,
      location: '',
      lock: false,
      mainStatKey: 'atk',
      rarity: 3,
      setKey: 'BandOfSizzlingThunder',
      slotKey: 'hands',
      substats: [
        { key: 'atk_', value: 5 },
        { key: 'def_', value: 5 },
      ],
    }
    const a3 = randomizeRelic({ slotKey: 'sphere' }) // in db but not in import
    const a4 = randomizeRelic({ slotKey: 'body' }) // in import but not in db

    const dupId = database.relics.new(a1)
    const upgradeId = database.relics.new(a2old)
    database.relics.new(a3)
    const srod1: ISrObjectDescription = {
      format: 'SROD',
      version: 1,
      source: 'Scanner',
      relics: [a1, a2new, a4],
    }
    const importResult = database.importSROD(
      srod1 as ISrObjectDescription & ISroDatabase,
      true,
      false
    )
    expect(importResult.relics.upgraded.length).toEqual(1)
    expect(importResult.relics.unchanged.length).toEqual(1)
    expect(importResult.relics.notInImport).toEqual(1)
    expect(importResult.relics.new.length).toEqual(1)
    expect(database.relics.values.length).toEqual(4)
    const dbA1 = database.relics.get(dupId)
    expect(dbA1?.slotKey).toEqual('head')
    const dbA2 = database.relics.get(upgradeId)
    expect(dbA2?.slotKey).toEqual('hands')
    expect(dbA2?.level).toEqual(4)
  })
  test('Import character without lightCone should not give default lightCone', () => {
    const srod: ISrObjectDescription = {
      format: 'SROD',
      version: 1,
      source: 'Scanner',
      characters: [
        {
          key: 'March7th',
          level: 40,
          eidolon: 0,
          ascension: 1,
          basic: 1,
          skill: 1,
          ult: 1,
          talent: 1,
          bonusAbilities: objKeyMap(range(1, 3), () => false),
          statBoosts: objKeyMap(range(1, 10), () => false),
        },
      ],
    }
    const importResult = database.importSROD(
      srod as ISrObjectDescription & ISroDatabase,
      false,
      false
    )
    expect(importResult.lightCones.new.length).toEqual(0)
    expect(importResult.characters.new.length).toEqual(1)
    expect(database.chars.get('March7th')?.equippedLightCone).toBeFalsy()
  })
  describe('import again with overlapping ids', () => {
    test('import again with overlapping relic ids', () => {
      const old1 = randomizeRelic({ slotKey: 'head' })
      const old2 = randomizeRelic({ slotKey: 'hands' })
      const old3 = randomizeRelic({ slotKey: 'sphere' })
      const old4 = randomizeRelic({ slotKey: 'body' })

      const oldId1 = database.relics.new(old1)
      const oldId2 = database.relics.new(old2)
      const oldId3 = database.relics.new(old3)
      const oldId4 = database.relics.new(old4)
      expect([oldId1, oldId2, oldId3, oldId4]).toEqual([
        'sro_relic_0',
        'sro_relic_1',
        'sro_relic_2',
        'sro_relic_3',
      ])

      const srod: ISrObjectDescription = {
        format: 'SROD',
        version: 1,
        source: SroSource,
        relics: [
          { ...old1, id: oldId1 } as IRelic,
          { ...old2, id: oldId2 } as IRelic,

          //swap these two
          { ...old4, id: oldId3 } as IRelic,
          { ...old3, id: oldId4 } as IRelic,
        ],
      }

      const importResult = database.importSROD(
        srod as ISrObjectDescription & ISroDatabase,
        true,
        false
      )
      expect(importResult.relics.notInImport).toEqual(0)
      expect(importResult.relics.unchanged.length).toEqual(4)
      expect(database.relics.values.length).toEqual(4)
      // Expect imports to overwrite the id of old
      expect(database.relics.get(oldId1)?.slotKey).toEqual('head')
      expect(database.relics.get(oldId2)?.slotKey).toEqual('hands')
      expect(database.relics.get(oldId3)?.slotKey).toEqual('body')
      expect(database.relics.get(oldId4)?.slotKey).toEqual('sphere')
    })

    test('import again with overlapping lightCone ids', () => {
      const old1 = newLightCone('MakeTheWorldClamor')
      const old2 = newLightCone('TrendOfTheUniversalMarket')
      const old3 = newLightCone('Chorus')
      const old4 = newLightCone('ASecretVow')

      const oldId1 = database.lightCones.new(old1)
      const oldId2 = database.lightCones.new(old2)
      const oldId3 = database.lightCones.new(old3)
      const oldId4 = database.lightCones.new(old4)
      expect([oldId1, oldId2, oldId3, oldId4]).toEqual([
        'sro_lightCone_0',
        'sro_lightCone_1',
        'sro_lightCone_2',
        'sro_lightCone_3',
      ])

      const srod: ISrObjectDescription = {
        format: 'SROD',
        version: 1,
        source: SroSource,
        lightCones: [
          { ...old1, id: oldId1 } as ILightCone,
          { ...old2, id: oldId2 } as ILightCone,

          //swap these two
          { ...old4, id: oldId3 } as ILightCone,
          { ...old3, id: oldId4 } as ILightCone,
        ],
      }

      const importResult = database.importSROD(
        srod as ISrObjectDescription & ISroDatabase,
        true,
        false
      )
      expect(importResult.lightCones.notInImport).toEqual(0)
      expect(importResult.lightCones.unchanged.length).toEqual(4)
      expect(database.lightCones.values.length).toEqual(4)
      // Expect imports to overwrite the id of old
      expect(database.lightCones.get(oldId1)?.key).toEqual('MakeTheWorldClamor')
      expect(database.lightCones.get(oldId2)?.key).toEqual(
        'TrendOfTheUniversalMarket'
      )
      expect(database.lightCones.get(oldId3)?.key).toEqual('ASecretVow')
      expect(database.lightCones.get(oldId4)?.key).toEqual('Chorus')
    })
  })

  describe('mutual exclusion import with ids', () => {
    test('import with mutually-exclusive relic ids', () => {
      const old1 = randomizeRelic({ slotKey: 'head' })
      const old2 = randomizeRelic({ slotKey: 'hands' })
      const new1 = randomizeRelic({ slotKey: 'sphere' })
      const new2 = randomizeRelic({ slotKey: 'body' })

      const oldId1 = database.relics.new(old1)
      const oldId2 = database.relics.new(old2)
      expect([oldId1, oldId2]).toEqual(['sro_relic_0', 'sro_relic_1'])

      const srod: ISrObjectDescription = {
        format: 'SROD',
        version: 1,
        source: SroSource,
        relics: [
          { ...new1, id: oldId1 } as IRelic,
          { ...new2, id: oldId2 } as IRelic,
        ],
      }

      const importResult = database.importSROD(
        srod as ISrObjectDescription & ISroDatabase,
        true,
        false
      )
      expect(importResult.relics.notInImport).toEqual(2)
      expect(database.relics.values.length).toEqual(4)
      // Expect imports to overwrite the id of old
      expect(database.relics.get(oldId1)?.slotKey).toEqual('sphere')
      expect(database.relics.get(oldId2)?.slotKey).toEqual('body')
      // Expect old relics to have new id
      expect(
        database.relics.values.find((a) => a.slotKey === 'head')?.id
      ).not.toEqual(oldId1)
      expect(
        database.relics.values.find((a) => a.slotKey === 'hands')?.id
      ).not.toEqual(oldId2)
    })

    test('import with mutually exclusive lightCone ids', () => {
      const old1 = newLightCone('ASecretVow')
      const old2 = newLightCone('Cornucopia')
      const new1 = newLightCone('Amber')
      const new2 = newLightCone('DataBank')

      const oldId1 = database.lightCones.new(old1)
      const oldId2 = database.lightCones.new(old2)
      expect([oldId1, oldId2]).toEqual(['sro_lightCone_0', 'sro_lightCone_1'])

      const srod: ISrObjectDescription = {
        format: 'SROD',
        version: 1,
        source: SroSource,
        lightCones: [
          { ...new1, id: oldId1 } as ILightCone,
          { ...new2, id: oldId2 } as ILightCone,
        ],
      }

      const importResult = database.importSROD(
        srod as ISrObjectDescription & ISroDatabase,
        true,
        false
      )
      expect(importResult.lightCones.notInImport).toEqual(2)
      expect(database.lightCones.values.length).toEqual(4)
      // Expect imports to overwrite the id of old
      expect(database.lightCones.get(oldId1)?.key).toEqual('Amber')
      expect(database.lightCones.get(oldId2)?.key).toEqual('DataBank')
      // Expect old relics to have new id
      expect(
        database.lightCones.values.find((a) => a.key === 'ASecretVow')?.id
      ).not.toEqual(oldId1)
      expect(
        database.lightCones.values.find((a) => a.key === 'Cornucopia')?.id
      ).not.toEqual(oldId2)
    })
  })

  describe('Trailblazer Handling', () => {
    test('Test Trailblazer do not share equipment', () => {
      database.chars.set(
        'TrailblazerPhysical',
        initialCharacter('TrailblazerPhysical')
      )
      database.chars.set('TrailblazerFire', initialCharacter('TrailblazerFire'))
      const relic1 = randomizeRelic({
        slotKey: 'body',
        setKey: 'BandOfSizzlingThunder',
      })
      const relic1Id = database.relics.new({
        ...relic1,
        location: 'TrailblazerFire',
      })

      expect(
        database.chars.get('TrailblazerPhysical')!.equippedRelics.body
      ).toBeUndefined()
      expect(
        database.chars.get('TrailblazerFire')!.equippedRelics.body
      ).toEqual(relic1Id)
      const lightCone1Id = database.chars.get(
        'TrailblazerPhysical'
      )!.equippedLightCone
      expect(database.chars.get('TrailblazerFire')!.equippedLightCone).toEqual(
        lightCone1Id
      )

      const relic2 = randomizeRelic({
        slotKey: 'body',
        setKey: 'BelobogOfTheArchitects',
      })
      const relic2Id = database.relics.new({
        ...relic2,
        location: 'TrailblazerPhysical',
      })
      expect(
        database.chars.get('TrailblazerPhysical')!.equippedRelics.body
      ).toEqual(relic2Id)
      expect(
        database.chars.get('TrailblazerFire')!.equippedRelics.body
      ).toEqual(relic1Id)

      const lightCone2Id = database.lightCones.new({
        ...newLightCone('Chorus'),
        location: 'TrailblazerPhysical',
      })
      expect(
        database.chars.get('TrailblazerPhysical')!.equippedLightCone
      ).toEqual(lightCone2Id)
      expect(
        database.chars.get('TrailblazerFire')!.equippedLightCone
      ).toBeUndefined()

      // deletion dont remove equipment on other trailblazer
      database.chars.remove('TrailblazerFire')

      expect(
        database.chars.get('TrailblazerPhysical')!.equippedRelics.body
      ).toEqual(relic2Id)
      expect(
        database.chars.get('TrailblazerPhysical')!.equippedLightCone
      ).toEqual(lightCone2Id)
      expect(database.relics.get(relic2Id)!.location).toEqual(
        'TrailblazerPhysical'
      )
      expect(database.lightCones.get(lightCone2Id)!.location).toEqual(
        'TrailblazerPhysical'
      )

      // deletion of proper trailblazer does unequip
      database.chars.remove('TrailblazerPhysical')

      expect(database.relics.get(relic2Id)!.location).toEqual('')
      expect(database.lightCones.get(lightCone2Id)!.location).toEqual('')
    })
  })

  describe('DataManager.changeId', () => {
    test('should changeId for relics', () => {
      const relic = randomizeRelic({ location: 'March7th', slotKey: 'head' })
      const oldId = database.relics.new(relic)
      const newId = 'newTestId'
      expect(database.relics.changeId(oldId, newId)).toBeTruthy()

      expect(database.relics.get(oldId)).toBeUndefined()

      const cachrelic = database.relics.get(newId)
      expect(cachrelic).toBeTruthy()
      expect(cachrelic?.location).toEqual('March7th')
      expect(database.chars.get('March7th')?.equippedRelics.head).toEqual(newId)
    })
    test('should changeId for lightCones', () => {
      const lightCone = newLightCone('TrendOfTheUniversalMarket')
      lightCone.location = 'March7th'
      const oldId = database.lightCones.new(lightCone)
      const newId = 'newTestId'
      database.lightCones.changeId(oldId, newId)

      expect(database.lightCones.get(oldId)).toBeUndefined()

      const cachWea = database.lightCones.get(newId)
      expect(cachWea).toBeTruthy()
      expect(cachWea?.location).toEqual('March7th')
      expect(database.chars.get('March7th')?.equippedLightCone).toEqual(newId)
    })
  })

  test('Test mismatch lightCone path location; lc should stay equipped', () => {
    // Add Character and Relic
    const march7th = initialCharacter('March7th')
    const march7thLightCone = newLightCone('TrendOfTheUniversalMarket')
    march7thLightCone.location = 'March7th'

    database.chars.set(march7th.key, march7th)
    const swordid = database.lightCones.new(march7thLightCone)
    database.lightCones.set(swordid, march7thLightCone)

    expect(database.chars.get('March7th')?.equippedLightCone).toEqual(swordid)
    const srod1: ISrObjectDescription = {
      format: 'SROD',
      version: 1,
      source: 'Scanner',
      lightCones: [
        // Invalid Abundance on Preservation char
        { ...newLightCone('Chorus'), location: 'March7th' },
      ],
    }
    const importResult = database.importSROD(
      srod1 as ISrObjectDescription & ISroDatabase,
      true,
      false
    )
    expect(importResult.lightCones.new.length).toEqual(1)
    expect(importResult.characters.new.length).toEqual(0)
    expect(
      database.lightCones.get(database.chars.get('March7th')?.equippedLightCone)
        ?.key
    ).toEqual('Chorus')
  })
})

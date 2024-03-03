import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import type { CharacterKey, GenderKey } from '@genshin-optimizer/gi/consts'
import type {
  ArtCharDatabase,
  ICachedArtifact,
  ICachedCharacter,
  ICachedWeapon,
} from '@genshin-optimizer/gi/db'
import { defaultInitialWeapon } from '@genshin-optimizer/gi/db'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { useDeferredValue, useEffect, useMemo } from 'react'
import type { TeamData } from '../Context/DataContext'
import { allArtifactData } from '../Data/Artifacts'
import { getCharSheet } from '../Data/Characters'
import type CharacterSheet from '../Data/Characters/CharacterSheet'
import { resonanceData } from '../Data/Resonance'
import { getWeaponSheet } from '../Data/Weapons'
import WeaponSheet from '../Data/Weapons/WeaponSheet'
import { common } from '../Formula'
import {
  dataObjForArtifact,
  dataObjForCharacter,
  dataObjForWeapon,
  mergeData,
  uiDataForTeam,
} from '../Formula/api'
import type { Data } from '../Formula/type'
import { objectMap } from '../Util/Util'

type TeamDataBundle = {
  teamData: Dict<CharacterKey, Data[]>
  teamBundle: Dict<CharacterKey, CharBundle>
}

/**
 * Get data for a single character. This does not take account of team/conditionals etc. This is only used for non-detailed UI view like character card.
 */
export default function useCharData(
  characterKey: CharacterKey | '',
  mainStatAssumptionLevel = 0,
  overrideArt?: ICachedArtifact[] | Data,
  overrideWeapon?: ICachedWeapon
): TeamData | undefined {
  const database = useDatabase()
  const [dbDirty, setDbDirty] = useForceUpdate()
  const dbDirtyDeferred = useDeferredValue(dbDirty)
  const { gender } = useDBMeta()
  const data = useMemo(
    () =>
      dbDirtyDeferred &&
      getTeamDataCalc(
        database,
        characterKey,
        mainStatAssumptionLevel,
        gender,
        overrideArt,
        overrideWeapon
      ),
    [
      dbDirtyDeferred,
      gender,
      characterKey,
      database,
      mainStatAssumptionLevel,
      overrideArt,
      overrideWeapon,
    ]
  )

  useEffect(
    () =>
      characterKey
        ? database.chars.follow(characterKey, setDbDirty)
        : undefined,
    [characterKey, setDbDirty, database]
  )

  return data
}
class CharCalcCache {
  data: Partial<Record<CharacterKey, TeamData>>
  constructor(database: ArtCharDatabase) {
    this.data = {}
    database.chars.followAny((a) => {
      this.removeData(a)
    })
  }
  getData(ck: CharacterKey) {
    return this.data[ck]
  }
  cacheData(ck: CharacterKey, data: TeamData) {
    this.data[ck] = data
  }
  removeData(ck: CharacterKey) {
    delete this.data[ck]
  }
}
// cache are mapped per database
const cacheMap: Map<ArtCharDatabase, CharCalcCache> = new Map()
const getCache = (database: ArtCharDatabase) => {
  if (cacheMap.has(database)) return cacheMap.get(database)
  const cache = new CharCalcCache(database)
  cacheMap.set(database, cache)
  return cache
}

function getTeamDataCalc(
  database: ArtCharDatabase,
  characterKey: CharacterKey | '',
  mainStatAssumptionLevel = 0,
  gender: GenderKey,
  overrideArt?: ICachedArtifact[] | Data,
  overrideWeapon?: ICachedWeapon
): TeamData | undefined {
  if (!characterKey) return undefined

  // Retrive from cache
  if (!mainStatAssumptionLevel && !overrideArt && !overrideWeapon) {
    const cache = getCache(database).getData(characterKey)
    if (cache) return cache as TeamData
  }
  const { teamData, teamBundle } =
    getCharData(
      database,
      characterKey,
      mainStatAssumptionLevel,
      overrideArt,
      overrideWeapon
    ) ?? {}
  if (!teamData || !teamBundle) return undefined

  const calcData = uiDataForTeam(teamData, gender, characterKey)

  const data = objectMap(calcData, (obj, ck) => {
    const { data: _, ...rest } = teamBundle[ck]!
    return { ...obj, ...rest }
  })
  if (!mainStatAssumptionLevel && !overrideArt && !overrideWeapon)
    getCache(database).cacheData(characterKey, data)
  return data
}
/**
 * This is now used more for getting basic stat for a single char with some basic assumptions
 */
function getCharData(
  database: ArtCharDatabase,
  characterKey: CharacterKey | '',
  mainStatAssumptionLevel = 0,
  overrideArt?: ICachedArtifact[] | Data,
  overrideWeapon?: ICachedWeapon
): TeamDataBundle | undefined {
  if (!characterKey) return undefined
  const character = database.chars.get(characterKey)
  if (!character) return undefined

  const char1DataBundle = getCharDataBundle(
    database,
    true,
    mainStatAssumptionLevel,
    character,
    overrideWeapon
      ? overrideWeapon
      : database.weapons.get(character.equippedWeapon) ??
          defaultInitialWeapon(),
    overrideArt ??
      (Object.values(character.equippedArtifacts)
        .map((a) => database.arts.get(a))
        .filter((a) => a) as ICachedArtifact[])
  )
  if (!char1DataBundle) return undefined
  const teamBundle = { [characterKey]: char1DataBundle }
  const teamData: Dict<CharacterKey, Data[]> = {
    [characterKey]: char1DataBundle.data,
  }

  return { teamData, teamBundle }
}
type CharBundle = {
  character: ICachedCharacter
  weapon: ICachedWeapon
  characterSheet: CharacterSheet
  weaponSheet: WeaponSheet
  data: Data[]
}

function getCharDataBundle(
  database: ArtCharDatabase,
  useCustom = false,
  mainStatAssumptionLevel: number,
  character: ICachedCharacter,
  weapon: ICachedWeapon,
  artifacts: ICachedArtifact[] | Data
): CharBundle | undefined {
  const characterSheet = getCharSheet(character.key, database.gender)
  if (!characterSheet) return undefined
  const weaponSheet = getWeaponSheet(weapon.key)
  if (!weaponSheet) return undefined

  const weaponSheetsDataOfType = WeaponSheet.getAllDataOfType(
    characterSheet.weaponTypeKey
  )

  const weaponSheetsData = useCustom
    ? (() => {
        // display is included in WeaponSheet.getAllDataOfType
        const { display, ...restWeaponSheetData } = weaponSheet.data
        return mergeData([restWeaponSheetData, weaponSheetsDataOfType])
      })()
    : weaponSheet.data

  const sheetData = mergeData([
    characterSheet.data,
    weaponSheetsData,
    allArtifactData,
  ])
  const artifactData = Array.isArray(artifacts)
    ? artifacts.map((a) => dataObjForArtifact(a, mainStatAssumptionLevel))
    : [artifacts]
  const data = [
    ...artifactData,
    dataObjForCharacter(character),
    dataObjForWeapon(weapon),
    sheetData,
    common, // NEED TO PUT THIS AT THE END
    resonanceData,
  ]
  return { character, weapon, characterSheet, weaponSheet, data }
}

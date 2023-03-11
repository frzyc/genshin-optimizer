import { useContext, useDeferredValue, useEffect, useMemo } from 'react'
import type { TeamData } from '../Context/DataContext'
import { allArtifactData } from '../Data/Artifacts'
import { getCharSheet } from '../Data/Characters'
import type CharacterSheet from '../Data/Characters/CharacterSheet'
import { resonanceData } from '../Data/Resonance'
import { getWeaponSheet } from '../Data/Weapons'
import WeaponSheet from '../Data/Weapons/WeaponSheet'
import type { ArtCharDatabase } from '../Database/Database'
import { DatabaseContext } from '../Database/Database'
import { common } from '../Formula'
import {
  dataObjForArtifact,
  dataObjForCharacter,
  dataObjForWeapon,
  mergeData,
  uiDataForTeam,
} from '../Formula/api'
import type { Data } from '../Formula/type'
import type { ICachedArtifact } from '../Types/artifact'
import type { ICachedCharacter } from '../Types/character'
import type { CharacterKey, Gender } from '../Types/consts'
import type { ICachedWeapon } from '../Types/weapon'
import { objectMap } from '../Util/Util'
import { defaultInitialWeapon } from '../Util/WeaponUtil'
import useDBMeta from './useDBMeta'
import useForceUpdate from './useForceUpdate'

type TeamDataBundle = {
  teamData: Dict<CharacterKey, Data[]>
  teamBundle: Dict<CharacterKey, CharBundle>
}

export default function useTeamData(
  characterKey: CharacterKey | '',
  mainStatAssumptionLevel = 0,
  overrideArt?: ICachedArtifact[] | Data,
  overrideWeapon?: ICachedWeapon
): TeamData | undefined {
  const { database } = useContext(DatabaseContext)
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

function getTeamDataCalc(
  database: ArtCharDatabase,
  characterKey: CharacterKey | '',
  mainStatAssumptionLevel = 0,
  gender: Gender,
  overrideArt?: ICachedArtifact[] | Data,
  overrideWeapon?: ICachedWeapon
): TeamData | undefined {
  if (!characterKey) return

  // Retrive from cache
  if (!mainStatAssumptionLevel && !overrideArt && !overrideWeapon) {
    const cache = database._getTeamData(characterKey)
    if (cache) return cache
  }
  const { teamData, teamBundle } =
    getTeamData(
      database,
      characterKey,
      mainStatAssumptionLevel,
      overrideArt,
      overrideWeapon
    ) ?? {}
  if (!teamData || !teamBundle) return

  const calcData = uiDataForTeam(teamData, gender, characterKey)

  const data = objectMap(calcData, (obj, ck) => {
    const { data: _, ...rest } = teamBundle[ck]!
    return { ...obj, ...rest }
  })
  if (!mainStatAssumptionLevel && !overrideArt && !overrideWeapon)
    database.cacheTeamData(characterKey, data)
  return data
}

export function getTeamData(
  database: ArtCharDatabase,
  characterKey: CharacterKey | '',
  mainStatAssumptionLevel = 0,
  overrideArt?: ICachedArtifact[] | Data,
  overrideWeapon?: ICachedWeapon
): TeamDataBundle | undefined {
  if (!characterKey) return
  const character = database.chars.get(characterKey)
  if (!character) return

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
  if (!char1DataBundle) return
  const teamBundle = { [characterKey]: char1DataBundle }
  const teamData: Dict<CharacterKey, Data[]> = {
    [characterKey]: char1DataBundle.data,
  }

  char1DataBundle.character.team.forEach((ck) => {
    if (!ck) return
    const tchar = database.chars.get(ck)
    if (!tchar) return
    const databundle = getCharDataBundle(
      database,
      false,
      0,
      { ...tchar, conditional: character.teamConditional[ck] ?? {} },
      database.weapons.get(tchar.equippedWeapon) ?? defaultInitialWeapon(),
      Object.values(tchar.equippedArtifacts)
        .map((a) => database.arts.get(a))
        .filter((a) => a) as ICachedArtifact[]
    )
    if (!databundle) return
    teamBundle[ck] = databundle
    teamData[ck] = databundle.data
  })

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
  if (!characterSheet) return
  const weaponSheet = getWeaponSheet(weapon.key)
  if (!weaponSheet) return

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
    dataObjForCharacter(character, useCustom ? sheetData : undefined),
    dataObjForWeapon(weapon),
    sheetData,
    common, // NEED TO PUT THIS AT THE END
    resonanceData,
  ]
  return { character, weapon, characterSheet, weaponSheet, data }
}

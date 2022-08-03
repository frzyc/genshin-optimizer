import { useCallback, useContext, useDeferredValue, useEffect } from "react";
import { ArtifactSheet } from "../Data/Artifacts/ArtifactSheet";
import CharacterSheet from "../Data/Characters/CharacterSheet";
import { resonanceData } from "../Data/Resonance";
import WeaponSheet from "../Data/Weapons/WeaponSheet";
import { ArtCharDatabase, DatabaseContext } from "../Database/Database";
import { TeamData } from "../Context/DataContext";
import { common } from "../Formula";
import { dataObjForArtifact, dataObjForCharacter, dataObjForWeapon, mergeData, uiDataForTeam } from "../Formula/api";
import { Data } from "../Formula/type";
import { ICachedArtifact } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character";
import { CharacterKey } from "../Types/consts";
import { ICachedWeapon } from "../Types/weapon";
import { objectMap } from "../Util/Util";
import useForceUpdate from "./useForceUpdate";
import usePromise from "./usePromise";

type TeamDataBundle = {
  teamData: Dict<CharacterKey, Data[]>
  teamBundle: Dict<CharacterKey, CharBundle>
}

export default function useTeamData(characterKey: CharacterKey | "", mainStatAssumptionLevel: number = 0, overrideArt?: ICachedArtifact[], overrideWeapon?: ICachedWeapon): TeamData | undefined {
  const { database } = useContext(DatabaseContext)
  const [dbDirty, setDbDirty] = useForceUpdate()
  const dbDirtyDeferred = useDeferredValue(dbDirty)
  const data = usePromise(() => getTeamDataCalc(database, characterKey, mainStatAssumptionLevel, overrideArt, overrideWeapon), [dbDirtyDeferred, characterKey, database, mainStatAssumptionLevel, overrideArt, overrideWeapon])
  useEffect(() =>
    characterKey ? database.chars.follow(characterKey, setDbDirty) : undefined,
    [characterKey, setDbDirty, database])

  useEffect(() =>
    characterKey ? database.arts.followAny(setDbDirty) : undefined,
    [characterKey, setDbDirty, database])

  const team = Object.keys(data ?? {})
  const [t1, t2, t3, t4] = team

  const setTeamDataDirty = useCallback(() => {
    team.map(c => database.invalidateTeamData(c))
    setDbDirty()
  }, [database, team, setDbDirty])


  useEffect(() =>
    t1 ? database.chars.follow(t1, setTeamDataDirty) : undefined,
    [t1, setTeamDataDirty, database])
  useEffect(() =>
    t2 ? database.chars.follow(t2, setTeamDataDirty) : undefined,
    [t2, setTeamDataDirty, database])
  useEffect(() =>
    t3 ? database.chars.follow(t3, setTeamDataDirty) : undefined,
    [t3, setTeamDataDirty, database])
  useEffect(() =>
    t4 ? database.chars.follow(t4, setTeamDataDirty) : undefined,
    [t4, setTeamDataDirty, database])

  return data
}

async function getTeamDataCalc(database: ArtCharDatabase, characterKey: CharacterKey | "", mainStatAssumptionLevel: number = 0, overrideArt?: ICachedArtifact[], overrideWeapon?: ICachedWeapon):
  Promise<TeamData | undefined> {
  if (!characterKey) return

  // Retrive from cache
  if (!mainStatAssumptionLevel && !overrideArt && !overrideWeapon) {
    const cache = database._getTeamData(characterKey)
    if (cache) return cache
  }
  const { teamData, teamBundle } = (await getTeamData(database, characterKey, mainStatAssumptionLevel, overrideArt, overrideWeapon)) ?? {}
  if (!teamData || !teamBundle) return

  const calcData = uiDataForTeam(teamData, characterKey as CharacterKey)

  const data = objectMap(calcData, (obj, ck) => {
    const { data: _, ...rest } = teamBundle[ck]!
    return { ...obj, ...rest }
  })
  if (!mainStatAssumptionLevel && !overrideArt && !overrideWeapon)
    database.cacheTeamData(characterKey, data)
  return data
}

export async function getTeamData(database: ArtCharDatabase, characterKey: CharacterKey | "", mainStatAssumptionLevel: number = 0, overrideArt?: ICachedArtifact[], overrideWeapon?: ICachedWeapon):
  Promise<TeamDataBundle | undefined> {
  if (!characterKey) return
  const char1DataBundle = await getCharDataBundle(database, characterKey, true, mainStatAssumptionLevel, overrideArt, overrideWeapon)
  if (!char1DataBundle) return
  const teamBundle = { [characterKey]: char1DataBundle }
  const teamData: Dict<CharacterKey, Data[]> = { [characterKey]: char1DataBundle.data }

  await Promise.all(char1DataBundle.character.team.map(async (ck) => {
    if (!ck) return
    const databundle = await getCharDataBundle(database, ck)
    if (!databundle) return
    teamBundle[ck] = databundle
    teamData[ck] = databundle.data
  }))

  return { teamData, teamBundle }
}
type CharBundle = {
  character: ICachedCharacter,
  weapon: ICachedWeapon,
  characterSheet: CharacterSheet,
  weaponSheet: WeaponSheet,
  data: Data[]
}
async function getCharDataBundle(database: ArtCharDatabase, characterKey: CharacterKey | "", useCustom = false, mainStatAssumptionLevel: number = 0, overrideArt?: ICachedArtifact[], overrideWeapon?: ICachedWeapon)
  : Promise<CharBundle | undefined> {
  if (!characterKey) return
  const character = database.chars.get(characterKey)
  if (!character) return
  const weapon = overrideWeapon ?? database.weapons.get(character.equippedWeapon)
  if (!weapon) return
  const characterSheet = await CharacterSheet.get(characterKey)
  if (!characterSheet) return

  const weaponSheet = await WeaponSheet.get(weapon.key)
  if (!weaponSheet) return

  const weaponSheetsDataOfType = await WeaponSheet.getAllDataOfType(characterSheet.weaponTypeKey)

  const weaponSheetsData = useCustom ? (() => {
    // display is included in WeaponSheet.getAllDataOfType
    const { display, ...restWeaponSheetData } = weaponSheet.data
    return mergeData([restWeaponSheetData, weaponSheetsDataOfType])
  })() : weaponSheet.data

  const artifactSheetsData = await ArtifactSheet.getAllData
  const artifacts = (overrideArt ?? Object.values(character.equippedArtifacts).map(a => database.arts.get(a))).filter(a => a) as ICachedArtifact[]
  const sheetData = mergeData([characterSheet.getData(character.elementKey), weaponSheetsData, artifactSheetsData])
  const data = [
    ...artifacts.map(a => dataObjForArtifact(a, mainStatAssumptionLevel)),
    dataObjForCharacter(character, useCustom ? sheetData : undefined),
    dataObjForWeapon(weapon),
    sheetData,
    common, // NEED TO PUT THIS AT THE END
    resonanceData,
  ]
  return { character, weapon, characterSheet, weaponSheet, data }
}

import { useContext, useDeferredValue, useEffect } from "react";
import { ArtifactSheet } from "../Data/Artifacts/ArtifactSheet";
import CharacterSheet from "../Data/Characters/CharacterSheet";
import { resonanceData } from "../Data/Resonance";
import WeaponSheet from "../Data/Weapons/WeaponSheet";
import { ArtCharDatabase, DatabaseContext } from "../Database/Database";
import { TeamData } from "../DataContext";
import { common } from "../Formula";
import { dataObjForArtifact, dataObjForCharacter, dataObjForWeapon, uiDataForTeam } from "../Formula/api";
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
    characterKey ? database.followChar(characterKey, setDbDirty) : undefined,
    [characterKey, setDbDirty, database])

  useEffect(() =>
    characterKey ? database.followAnyArt(setDbDirty) : undefined,
    [characterKey, setDbDirty, database])

  const [t1, t2, t3, t4] = Object.keys(data ?? {})
  useEffect(() =>
    t1 ? database.followChar(t1, setDbDirty) : undefined,
    [t1, setDbDirty, database])
  useEffect(() =>
    t2 ? database.followChar(t2, setDbDirty) : undefined,
    [t2, setDbDirty, database])
  useEffect(() =>
    t3 ? database.followChar(t3, setDbDirty) : undefined,
    [t3, setDbDirty, database])
  useEffect(() =>
    t4 ? database.followChar(t4, setDbDirty) : undefined,
    [t4, setDbDirty, database])

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
  const char1DataBundle = await getCharDataBundle(database, characterKey, mainStatAssumptionLevel, overrideArt, overrideWeapon)
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
async function getCharDataBundle(database: ArtCharDatabase, characterKey: CharacterKey | "", mainStatAssumptionLevel: number = 0, overrideArt?: ICachedArtifact[], overrideWeapon?: ICachedWeapon)
  : Promise<CharBundle | undefined> {
  if (!characterKey) return
  const character = database._getChar(characterKey)
  if (!character) return
  const weapon = overrideWeapon ?? database._getWeapon(character.equippedWeapon)
  if (!weapon) return
  const [characterSheet, weaponSheet, artifactSheetsData] = await Promise.all([
    CharacterSheet.get(characterKey),
    WeaponSheet.get(weapon.key),
    ArtifactSheet.getAllData
  ])
  if (!characterSheet || !weaponSheet || !artifactSheetsData) return
  const artifacts = (overrideArt ?? Object.values(character.equippedArtifacts).map(a => database._getArt(a))).filter(a => a) as ICachedArtifact[]
  const data = [
    ...artifacts.map(a => dataObjForArtifact(a, mainStatAssumptionLevel)),
    dataObjForCharacter(character),
    characterSheet.getData(character.elementKey),
    dataObjForWeapon(weapon),
    weaponSheet.data,
    artifactSheetsData,
    common, // NEED TO PUT THIS AT THE END
    resonanceData,
  ]
  return { character, weapon, characterSheet, weaponSheet, data }
}

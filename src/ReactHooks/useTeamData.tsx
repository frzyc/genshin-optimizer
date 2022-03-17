import { useContext, useEffect, useMemo, useState } from "react";
import { ArtifactSheet } from "../Data/Artifacts/ArtifactSheet";
import CharacterSheet from "../Data/Characters/CharacterSheet";
import { ArtCharDatabase, DatabaseContext } from "../Database/Database";
import { TeamData } from "../DataContext";
import { common } from "../Formula";
import { dataObjForArtifact, dataObjForCharacter, uiDataForTeam, dataObjForWeapon } from "../Formula/api";
import { Data } from "../Formula/type";
import { ICachedArtifact } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character_WR";
import { CharacterKey } from "../Types/consts";
import { ICachedWeapon } from "../Types/weapon";
import { objectMap } from "../Util/Util";
import WeaponSheet from "../Data/Weapons/WeaponSheet";
import useForceUpdate from "./useForceUpdate";

type TeamDataBundle = {
  team: CharacterKey[],
  teamData: Dict<CharacterKey, Data[]>
  teamBundle: Dict<CharacterKey, CharBundle>
}

export default function useTeamData(characterKey: CharacterKey | "", mainStatAssumptionLevel: number = 0): TeamData | undefined {
  const { database } = useContext(DatabaseContext)
  const [dbDirty, setDbDirty] = useForceUpdate()
  const [teamDataBundle, setTeamdataBundle] = useState(undefined as TeamDataBundle | undefined)
  useEffect(() => {
    getTeamData(database, characterKey, mainStatAssumptionLevel).then(r => setTeamdataBundle(r))
  }, [dbDirty, characterKey, database, mainStatAssumptionLevel])

  const { team = [], teamData, teamBundle } = teamDataBundle ?? {}

  useEffect(() =>
    characterKey ? database.followChar(characterKey, setDbDirty) : undefined,
    [characterKey, setDbDirty, database])

  const [t1, t2, t3, t4] = team
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

  const calcData = useMemo(() => {
    return teamData && uiDataForTeam(teamData, characterKey as CharacterKey)
  }, [teamData, characterKey])
  const data = useMemo(() => {
    if (!calcData || !teamBundle) return
    return objectMap(calcData, (obj, ck) => {
      const { data: _, ...rest } = teamBundle[ck]!
      return { ...obj, ...rest }
    })
  }, [calcData, teamBundle])

  return data
}

export async function getTeamData(database: ArtCharDatabase, characterKey: CharacterKey | "", mainStatAssumptionLevel: number = 0, overrideArt?: ICachedArtifact[]):
  Promise<TeamDataBundle | undefined> {
  if (!characterKey) return
  const char1DataBundle = await getCharDataBundle(database, characterKey, mainStatAssumptionLevel, overrideArt)
  if (!char1DataBundle) return
  const team: CharacterKey[] = [characterKey]
  const teamBundle = { [characterKey]: char1DataBundle }
  const teamData: Dict<CharacterKey, Data[]> = { [characterKey]: char1DataBundle.data }

  await Promise.all(char1DataBundle.character.team.map(async (ck) => {
    if (!ck) return
    const databundle = await getCharDataBundle(database, ck)
    if (!databundle) return
    team.push(ck)
    teamBundle[ck] = databundle
    teamData[ck] = databundle.data
  }))

  return { team, teamData, teamBundle }
}
type CharBundle = {
  character: ICachedCharacter,
  weapon: ICachedWeapon,
  characterSheet: CharacterSheet,
  weaponSheet: WeaponSheet,
  data: Data[]
}
async function getCharDataBundle(database: ArtCharDatabase, characterKey: CharacterKey | "", mainStatAssumptionLevel: number = 0, overrideArt?: ICachedArtifact[])
  : Promise<CharBundle | undefined> {
  if (!characterKey) return
  const character = database._getChar(characterKey)
  if (!character) return
  const weapon = database._getWeapon(character.equippedWeapon)
  if (!weapon) return
  const characterSheet = await CharacterSheet.get(characterKey)
  const weaponSheet = await WeaponSheet.get(weapon.key)
  const artifactSheetsData = await ArtifactSheet.getAllData
  if (!characterSheet || !weaponSheet || !artifactSheetsData) return
  const artifacts = (overrideArt ?? Object.values(character.equippedArtifacts).map(a => database._getArt(a))).filter(a => a) as ICachedArtifact[]
  const data = [
    ...artifacts.map(a => dataObjForArtifact(a, mainStatAssumptionLevel)),
    dataObjForCharacter(character),
    characterSheet.data,
    dataObjForWeapon(weapon),
    weaponSheet.data,
    artifactSheetsData,
    common, // NEED TO PUT THIS AT THE END
  ]
  return { character, weapon, characterSheet, weaponSheet, data }
}

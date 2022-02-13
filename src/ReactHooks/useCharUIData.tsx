import { useContext, useEffect, useMemo } from "react";
import { ArtifactSheet } from "../Data/Artifacts/ArtifactSheet";
import { DatabaseContext } from "../Database/Database";
import { common } from "../Formula";
import { computeUIData, dataObjForArtifact, dataObjForCharacter, dataObjForWeapon } from "../Formula/api";
import { CharacterKey } from "../Types/consts";
import { objectMap } from "../Util/Util";
import useCharacter from "./useCharacter";
import useForceUpdate from "./useForceUpdate";
import usePromise from "./usePromise";
import useWeapon from "./useWeapon";

/**
 * @deprecated
 * @param characterKey
 * @param mainStatAssumptionLevel
 * @returns
 */
export default function useCharUIData(characterKey: CharacterKey, mainStatAssumptionLevel: number = 0) {
  const database = useContext(DatabaseContext)
  const { character, characterSheet } = useCharacter(characterKey)
  const { weapon, weaponSheet } = useWeapon(character?.equippedWeapon)

  const artifactSheetsData = usePromise(ArtifactSheet.getAllData, [])

  const artifacts = useMemo(() => character && database && objectMap(character.equippedArtifacts, a => database._getArt(a)), [character, database])

  const [dbDirty, setDbDirty] = useForceUpdate()
  //follow updates from team
  const [teammate1, teammate2, teammate3] = character?.team ?? []
  useEffect(() =>
    teammate1 ? database.followChar(teammate1, setDbDirty) : undefined,
    [teammate1, setDbDirty, database])
  useEffect(() =>
    teammate2 ? database.followChar(teammate2, setDbDirty) : undefined,
    [teammate2, setDbDirty, database])
  useEffect(() =>
    teammate3 ? database.followChar(teammate3, setDbDirty) : undefined,
    [teammate3, setDbDirty, database])

  const dataWoArt = useMemo(() => dbDirty && character && characterSheet && weapon && weaponSheet && artifacts && artifactSheetsData && [
    dataObjForCharacter(character),
    characterSheet.data,
    dataObjForWeapon(weapon),
    weaponSheet.data,
    artifactSheetsData,
    common, // NEED TO PUT THIS AT THE END
  ], [dbDirty, character, characterSheet, weapon, weaponSheet, artifacts, artifactSheetsData])

  const data = useMemo(() => dataWoArt && artifacts && computeUIData([
    ...Object.values(artifacts).filter(a => a).map(a => dataObjForArtifact(a, mainStatAssumptionLevel)),
    ...dataWoArt,
  ]),
    [dataWoArt, artifacts, mainStatAssumptionLevel])
  if (!data || !character || !characterSheet || !weapon || !weaponSheet || !artifacts || !artifactSheetsData || !database || !dataWoArt)
    return undefined
  return { data, character, characterSheet, weapon, weaponSheet, artifacts, artifactSheetsData, database, dataWoArt }
}

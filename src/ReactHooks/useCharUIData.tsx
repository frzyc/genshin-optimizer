import { useContext, useEffect, useMemo } from "react";
import { ArtifactSheet } from "../Artifact/ArtifactSheet_WR";
import CharacterSheet from "../Character/CharacterSheet_WR";
import { DatabaseContext } from "../Database/Database";
import { common } from "../Formula/index";
import { computeUIData, dataObjForArtifact, dataObjForCharacter, dataObjForWeapon } from "../Formula/api";
import { CharacterKey, SlotKey } from "../Types/consts";
import { objectMap } from "../Util/Util";
import WeaponSheet from "../Weapon/WeaponSheet_WR";
import useCharacter from "./useCharacter";
import usePromise from "./usePromise";
import useWeapon from "./useWeapon";
import { ICachedArtifact } from "../Types/artifact_WR";
import useForceUpdate from "./useForceUpdate";

export default function useCharUIData(characterKey: CharacterKey | "" | undefined = "") {
  const database = useContext(DatabaseContext)
  const character = useCharacter(characterKey)
  const weapon = useWeapon(character?.equippedWeapon)

  const characterSheet = usePromise(CharacterSheet.get(characterKey), [characterKey])
  const artifactSheetsData = usePromise(ArtifactSheet.getAllData, [])

  const weaponSheet = usePromise(weapon && WeaponSheet.get(weapon.key), [weapon])
  const artifacts = useMemo(() => character && database && objectMap(character.equippedArtifacts, a => database._getArt(a)), [character, database]) as Record<SlotKey, ICachedArtifact | undefined>

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

  const data = useMemo(() => dbDirty && character && characterSheet && weapon && weaponSheet && artifacts && artifactSheetsData && computeUIData([
    common,
    dataObjForCharacter(character),
    characterSheet.data,
    dataObjForWeapon(weapon),
    weaponSheet.data,
    ...Object.values(artifacts).filter(a => a).map(a => dataObjForArtifact(a)),
    artifactSheetsData,
  ]),
    [dbDirty, character, characterSheet, weapon, weaponSheet, artifacts, artifactSheetsData])
  return { data, character, characterSheet, weapon, weaponSheet, artifacts, artifactSheetsData, database }
}

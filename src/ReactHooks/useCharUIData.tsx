import { useContext, useMemo } from "react";
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

export default function useCharUIData(characterKey: CharacterKey | "" | undefined = "") {
  const database = useContext(DatabaseContext)
  const character = useCharacter(characterKey)
  const weapon = useWeapon(character?.equippedWeapon)

  const characterSheet = usePromise(CharacterSheet.get(characterKey), [characterKey])
  const artifactSheetsData = usePromise(ArtifactSheet.getAllData, [])

  const weaponSheet = usePromise(weapon && WeaponSheet.get(weapon.key), [weapon])
  const artifacts = useMemo(() => character && database && objectMap(character.equippedArtifacts, a => database._getArt(a)), [character, database]) as Record<SlotKey, ICachedArtifact | undefined>

  const data = useMemo(() => character && characterSheet && weapon && weaponSheet && artifacts && artifactSheetsData && computeUIData([
    common,
    dataObjForCharacter(character),
    characterSheet.data,
    dataObjForWeapon(weapon),
    weaponSheet.data,
    ...Object.values(artifacts).filter(a => a).map(a => dataObjForArtifact(a)),
    artifactSheetsData,
  ]),
    [character, characterSheet, weapon, weaponSheet, artifacts, artifactSheetsData])
  return { data, character, characterSheet, weapon, weaponSheet, artifacts, artifactSheetsData, database }
}
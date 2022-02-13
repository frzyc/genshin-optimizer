import { useContext, useEffect, useState } from "react";
import CharacterSheet from "../Data/Characters/CharacterSheet";
import { DatabaseContext } from "../Database/Database";
import { ICachedCharacter } from "../Types/character_WR";
import { CharacterKey } from "../Types/consts";
import { useStablePromise } from "./usePromise";

export default function useCharacter(key: CharacterKey | undefined): { character?: ICachedCharacter, characterSheet?: CharacterSheet } {
  const database = useContext(DatabaseContext)
  const [character, set] = useState(database._getChar(key ?? ""))
  const characterSheet = useStablePromise(CharacterSheet.get(key ?? ""))

  useEffect(() => key && database.followChar(key, set), [database, key, set])
  return { character, characterSheet }
}

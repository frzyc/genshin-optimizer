import { useContext, useEffect, useState } from "react";
import { DatabaseContext } from "../Database/Database";
import { CharacterKey } from "../Types/consts";

export default function useCharacter(characterKey: CharacterKey | "" | undefined = "") {
  const database = useContext(DatabaseContext)
  const [character, updateCharacter] = useState(database._getChar(characterKey))
  useEffect(() => updateCharacter(database._getChar(characterKey)), [database, characterKey])
  useEffect(() =>
    characterKey ? database.followChar(characterKey, updateCharacter) : undefined,
    [characterKey, updateCharacter, database])
  return character
}
import { useContext, useEffect, useState } from "react";
import { DatabaseContext } from "../Database/Database";
import { CharacterKey } from "../Types/consts";

export default function useCharacter(characterKey: CharacterKey | "" | undefined = "") {
  const { database } = useContext(DatabaseContext)
  const [character, updateCharacter] = useState(database.chars.get(characterKey))
  useEffect(() => updateCharacter(database.chars.get(characterKey)), [database, characterKey])
  useEffect(() =>
    characterKey ? database.chars.follow(characterKey, updateCharacter) : undefined,
    [characterKey, updateCharacter, database])
  return character
}

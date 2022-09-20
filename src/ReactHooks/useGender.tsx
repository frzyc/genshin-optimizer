import { useEffect, useState } from "react";
import { ArtCharDatabase } from "../Database/Database";

export default function useGender(database: ArtCharDatabase) {
  const [gender, setG] = useState(database.gender)
  useEffect(() => database.states.follow("dbMeta", () => setG(database.gender)), [database, setG])
  return gender
}

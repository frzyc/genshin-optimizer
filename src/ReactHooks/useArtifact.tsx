import { useContext, useEffect, useState } from "react";
import { DatabaseContext } from "../Database/Database";

export default function useArtifact(artifactID: string | undefined = "") {
  const { database } = useContext(DatabaseContext)
  const [artifact, setArtifact] = useState(database.arts.get(artifactID))
  useEffect(() => setArtifact(database.arts.get(artifactID)), [database, artifactID])
  useEffect(() =>
    artifactID ? database.arts.follow(artifactID, setArtifact) : undefined,
    [artifactID, setArtifact, database])
  return artifact
}

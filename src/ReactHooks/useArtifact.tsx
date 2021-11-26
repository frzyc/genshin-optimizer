import { useContext, useEffect, useState } from "react";
import { DatabaseContext } from "../Database/Database";

export default function useArtifact(artifactID: string | undefined = "") {
  const database = useContext(DatabaseContext)
  const [artifact, setArtifact] = useState(database._getArt(artifactID))
  useEffect(() => setArtifact(database._getArt(artifactID)), [database, artifactID])
  useEffect(() =>
    artifactID ? database.followArt(artifactID, setArtifact) : undefined,
    [artifactID, setArtifact, database])
  return artifact
}
import { useContext, useEffect, useState } from "react";
import { ArtifactSheet } from "../Data/Artifacts/ArtifactSheet";
import { DatabaseContext } from "../Database/Database";
import { ICachedArtifact } from "../Types/artifact_WR";
import { useStablePromise } from "./usePromise";

export default function useArtifact(id: string | undefined): { artifact?: ICachedArtifact, artifactSheet?: ArtifactSheet } {
  const database = useContext(DatabaseContext)
  const [artifact, set] = useState(database._getArt(id ?? ""))
  const artifactSheet = useStablePromise(ArtifactSheet.get(artifact?.setKey))

  useEffect(() => id ? database.followArt(id, set) : undefined, [database, id, set])
  return { artifact, artifactSheet }

}

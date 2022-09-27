import { useContext, useEffect, useState } from "react"
import { DatabaseContext } from "../Database/Database"

export default function useDisplayArtifact() {
  const { database } = useContext(DatabaseContext)
  const [artifactDisplayState, setArtifactDisplayState] = useState(database.displayArtifact.get())
  useEffect(() => database.displayArtifact.follow((r, disArt) => setArtifactDisplayState(disArt)), [database])
  return artifactDisplayState
}

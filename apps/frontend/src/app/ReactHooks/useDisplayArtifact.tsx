import { useContext, useEffect, useState } from 'react'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'

export default function useDisplayArtifact() {
  const database = useDatabase()
  const [artifactDisplayState, setArtifactDisplayState] = useState(
    database.displayArtifact.get()
  )
  useEffect(
    () =>
      database.displayArtifact.follow((r, disArt) =>
        setArtifactDisplayState(disArt)
      ),
    [database]
  )
  return artifactDisplayState
}

import type { ICachedArtifact, LoadoutDatum } from '@genshin-optimizer/gi/db'
import { useEffect, useState } from 'react'
import { useDatabase } from './useDatabase'

export function useBuildArtifacts(loadoutDatum: LoadoutDatum) {
  const database = useDatabase()
  const [arts, setArts] = useState(
    database.teams.getLoadoutArtifacts(loadoutDatum)
  )
  // for when the entire loadoutDatum is changed.
  useEffect(() => {
    setArts(database.teams.getLoadoutArtifacts(loadoutDatum))
  }, [database, loadoutDatum])

  // for smaller artifact/build changes.
  useEffect(() => {
    const unfollows = Object.values(arts).map((art) =>
      art?.id
        ? database.arts.follow(art.id, (_k, r, v: ICachedArtifact) => {
            if (r === 'update') setArts((arts) => ({ ...arts, [v.slotKey]: v }))
            // remove event returns the deleted obj
            if (r === 'remove')
              setArts((arts) => ({ ...arts, [v.slotKey]: undefined }))
          })
        : () => {}
    )
    const unfollowBuild = database.builds.follow(
      loadoutDatum.buildId,
      (_, r) => {
        if (r === 'update')
          setArts(database.teams.getLoadoutArtifacts(loadoutDatum))
      }
    )
    return () => {
      unfollows.forEach((unfollow) => unfollow())
      unfollowBuild()
    }
  }, [arts, database, loadoutDatum])
  return arts
}

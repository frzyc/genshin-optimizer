'use client'
import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import { useEffect, useMemo } from 'react'
import { useDatabase } from './useDatabase'

export function useBuildArtifacts(loadoutDatum: LoadoutDatum) {
  const database = useDatabase()
  const [dbDirty, setDbDirty] = useForceUpdate()
  // for when the entire loadoutDatum is changed.
  const arts = useMemo(
    () => dbDirty && database.teams.getLoadoutArtifacts(loadoutDatum),
    [dbDirty, database.teams, loadoutDatum],
  )

  // for smaller artifact/build changes.
  useEffect(() => {
    const unfollows = Object.values(arts).map((art) =>
      art?.id
        ? database.arts.follow(
            art.id,
            (_k, r) => (r === 'update' || r === 'remove') && setDbDirty(),
          )
        : () => {},
    )
    const unfollowBuild = database.builds.follow(
      loadoutDatum.buildId,
      (_, r) => r === 'update' && setDbDirty(),
    )
    return () => {
      unfollows.forEach((unfollow) => unfollow())
      unfollowBuild()
    }
  }, [arts, database, loadoutDatum, setDbDirty])
  return arts
}

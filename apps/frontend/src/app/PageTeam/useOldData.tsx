import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { charKeyToLocCharKey } from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact, ICachedWeapon } from '@genshin-optimizer/gi/db'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { useContext, useDeferredValue, useEffect, useMemo } from 'react'
import { TeamCharacterContext } from '../Context/TeamCharacterContext'
import type { Data } from '../Formula/type'
import type { UIData } from '../Formula/uiData'
import { getTeamDataCalc } from '../ReactHooks/useTeamData'
import { getArtifactData } from './CharacterDisplay/Tabs/TabTheorycraft/optimizeTc'

/**
 * generate data for the "compare build function", usually used in conjunction with `DataContext.oldData`
 */
export default function useOldData(): undefined | UIData {
  const database = useDatabase()
  const {
    teamId,
    teamCharId,
    team: { teamCharIds },
    teamChar: {
      key: characterKey,
      compare,
      compareType,
      compareBuildId,
      compareBuildTcId,
    },
  } = useContext(TeamCharacterContext)

  const { gender } = useDBMeta()
  const [dbDirty, setDbDirty] = useForceUpdate()
  const dbDirtyDeferred = useDeferredValue(dbDirty)

  useEffect(
    () => (teamId ? database.teams.follow(teamId, setDbDirty) : undefined),
    [teamId, setDbDirty, database]
  )

  useEffect(() => {
    if (!dbDirty) return () => {}
    const unfollowTeamChars = teamCharIds.map((tcId) => {
      const unfollowTeamChar = database.teamChars.follow(tcId, setDbDirty)
      const unfollowChar = database.teamChars.followChar(tcId, setDbDirty)
      const unfollowBuild =
        tcId === teamCharId
          ? database.teamChars.followCompareBuild(tcId, setDbDirty)
          : database.teamChars.followBuild(tcId, setDbDirty)
      return () => {
        unfollowTeamChar()
        unfollowChar()
        unfollowBuild()
      }
    })

    return () => {
      unfollowTeamChars.forEach((unfollow) => unfollow())
    }
  }, [dbDirty, teamCharId, database, teamCharIds, setDbDirty])

  return useMemo(() => {
    if (!dbDirtyDeferred) return undefined
    if (!compare) return undefined
    const { overrideArt, overrideWeapon } = ((): {
      overrideArt: ICachedArtifact[] | Data
      overrideWeapon: ICachedWeapon
    } => {
      switch (compareType) {
        case 'equipped': {
          const char = database.chars.get(characterKey)!
          return {
            overrideArt: Object.values(char.equippedArtifacts)
              .map((id) => database.arts.get(id))
              .filter((a) => a) as ICachedArtifact[],
            overrideWeapon: database.weapons.get(char.equippedWeapon)!,
          }
        }
        case 'real': {
          const build = database.builds.get(compareBuildId)!
          return {
            overrideArt: Object.values(build.artifactIds)
              .map((id) => database.arts.get(id))
              .filter((a) => a) as ICachedArtifact[],
            overrideWeapon: database.weapons.get(build.weaponId)!,
          }
        }
        case 'tc': {
          const buildTc = database.buildTcs.get(compareBuildTcId)!
          return {
            overrideArt: getArtifactData(buildTc),
            overrideWeapon: {
              ...buildTc.weapon,
              location: charKeyToLocCharKey(characterKey),
            } as ICachedWeapon,
          }
        }
      }
    })()
    const teamData = getTeamDataCalc(
      database,
      teamId,
      gender,
      teamCharId,
      0,
      overrideArt,
      overrideWeapon
    )
    if (!teamData) return undefined
    const charUIData = teamData[characterKey]!.target
    return charUIData
  }, [
    dbDirtyDeferred,
    characterKey,
    teamCharId,
    teamId,
    gender,
    compare,
    compareType,
    compareBuildId,
    compareBuildTcId,
    database,
  ])
}

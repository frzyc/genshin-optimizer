import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { charKeyToLocCharKey } from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact, ICachedWeapon } from '@genshin-optimizer/gi/db'
import {
  TeamCharacterContext,
  useDBMeta,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import type { ICharacter } from '@genshin-optimizer/gi/good'
import {
  getBuildTcArtifactData,
  getTeamDataCalc,
} from '@genshin-optimizer/gi/ui'
import type { UIData } from '@genshin-optimizer/gi/uidata'
import type { Data } from '@genshin-optimizer/gi/wr'
import { useContext, useDeferredValue, useEffect, useMemo } from 'react'

/**
 * generate data for the "compare build function", usually used in conjunction with `DataContext.compareData`
 */
export default function useCompareData(): undefined | UIData {
  const database = useDatabase()
  const {
    teamId,
    teamCharId,
    loadoutDatum,
    team: { loadoutData },
    teamChar: { key: characterKey },
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
    const unfollowTeamChars = loadoutData.map((loadoutDatum) => {
      if (!loadoutDatum) return () => {}
      const unfollowTeamChar = loadoutDatum
        ? database.teamChars.follow(loadoutDatum.teamCharId, setDbDirty)
        : () => {}
      const unfollowChar = loadoutDatum
        ? database.teamChars.followChar(loadoutDatum.teamCharId, setDbDirty)
        : () => {}
      const unfollowBuild = loadoutDatum
        ? loadoutDatum.teamCharId === teamCharId
          ? database.teams.followLoadoutDatumCompare(loadoutDatum, setDbDirty)
          : database.teams.followLoadoutDatum(loadoutDatum, setDbDirty)
        : () => {}
      return () => {
        unfollowTeamChar()
        unfollowChar()
        unfollowBuild()
      }
    })

    return () => {
      unfollowTeamChars.forEach((unfollow) => unfollow())
    }
  }, [dbDirty, teamCharId, database, loadoutData, setDbDirty])

  return useMemo(() => {
    if (!dbDirtyDeferred) return undefined
    const { compare, compareType, compareBuildId, compareBuildTcId } =
      loadoutDatum
    if (!compare) return undefined
    const { overrideArt, overrideWeapon, overrideCharacter } = ((): {
      overrideArt: ICachedArtifact[] | Data
      overrideWeapon: ICachedWeapon
      overrideCharacter: Omit<ICharacter, 'key'>
    } => {
      const char = database.chars.get(characterKey)!
      switch (compareType) {
        case 'equipped': {
          return {
            overrideArt: Object.values(char.equippedArtifacts)
              .map((id) => database.arts.get(id))
              .filter((a) => a) as ICachedArtifact[],
            overrideWeapon: database.weapons.get(char.equippedWeapon)!,
            overrideCharacter: char,
          }
        }
        case 'real': {
          const build = database.builds.get(compareBuildId)!
          return {
            overrideArt: Object.values(build.artifactIds)
              .map((id) => database.arts.get(id))
              .filter((a) => a) as ICachedArtifact[],
            overrideWeapon: database.weapons.get(build.weaponId)!,
            overrideCharacter: char,
          }
        }
        case 'tc': {
          const buildTc = database.buildTcs.get(compareBuildTcId)!
          return {
            overrideArt: getBuildTcArtifactData(buildTc),
            overrideWeapon: {
              ...buildTc.weapon,
              location: charKeyToLocCharKey(characterKey),
            } as ICachedWeapon,
            overrideCharacter: buildTc.character ?? char,
          }
        }
      }
    })()
    const teamData = getTeamDataCalc(database, teamId, gender, teamCharId, 0, {
      [teamCharId]: {
        art: overrideArt,
        weapon: overrideWeapon,
        char: overrideCharacter,
      },
    })
    if (!teamData) return undefined
    const charUIData = teamData[characterKey]!.target
    return charUIData
  }, [
    dbDirtyDeferred,
    loadoutDatum,
    database,
    teamId,
    gender,
    teamCharId,
    characterKey,
  ])
}

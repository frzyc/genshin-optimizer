import { charKeyToLocCharKey } from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact, ICachedWeapon } from '@genshin-optimizer/gi/db'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { useContext, useMemo } from 'react'
import { TeamCharacterContext } from '../Context/TeamCharacterContext'
import type { Data } from '../Formula/type'
import type { UIData } from '../Formula/uiData'
import { getTeamDataCalc } from '../ReactHooks/useTeamData'
import { getArtifactData } from './CharacterDisplay/Tabs/TabTheorycraft/optimizeTc'

/**
 * generate data for the "compare loadout function", usually used in conjunction with `DataContext.oldData`
 */
export default function useOldData(): undefined | UIData {
  const database = useDatabase()
  const {
    teamId,
    teamCharId,
    teamChar: {
      key: characterKey,
      compare,
      compareType,
      compareBuildId,
      compareBuildTcId,
    },
  } = useContext(TeamCharacterContext)

  const { gender } = useDBMeta()

  return useMemo(() => {
    if (!compare) return undefined
    const { overrideArt, overrideWeapon } = ((): {
      overrideArt: ICachedArtifact[] | Data
      overrideWeapon: ICachedWeapon
    } => {
      switch (compareType) {
        case 'equipped': {
          const char = database.chars.get(characterKey)
          return {
            overrideArt: Object.values(char.equippedArtifacts)
              .map((id) => database.arts.get(id))
              .filter((a) => a),
            overrideWeapon: database.weapons.get(char.equippedWeapon),
          }
        }
        case 'real': {
          const build = database.builds.get(compareBuildId)
          return {
            overrideArt: Object.keys(build.artifactIds)
              .map((id) => database.arts.get(id))
              .filter((a) => a),
            overrideWeapon: database.weapons.get(build.weaponId),
          }
        }
        case 'tc': {
          const buildTc = database.buildTcs.get(compareBuildTcId)
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
    const charUIData = teamData[characterKey].target
    return charUIData
  }, [
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

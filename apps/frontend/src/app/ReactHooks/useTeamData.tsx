import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { objMap } from '@genshin-optimizer/common/util'
import type { CharacterKey, GenderKey } from '@genshin-optimizer/gi/consts'
import {
  type ArtCharDatabase,
  type ICachedArtifact,
  type ICachedCharacter,
  type ICachedWeapon,
} from '@genshin-optimizer/gi/db'
import { useDBMeta, useDatabase, useTeam } from '@genshin-optimizer/gi/db-ui'
import { useContext, useDeferredValue, useEffect, useMemo } from 'react'
import type { TeamData } from '../Context/DataContext'
import { TeamCharacterContext } from '../Context/TeamCharacterContext'
import { allArtifactData } from '../Data/Artifacts'
import { getCharSheet } from '../Data/Characters'
import type CharacterSheet from '../Data/Characters/CharacterSheet'
import { resonanceData } from '../Data/Resonance'
import { getWeaponSheet } from '../Data/Weapons'
import WeaponSheet from '../Data/Weapons/WeaponSheet'
import { common } from '../Formula'
import type { CharInfo } from '../Formula/api'
import {
  dataObjForArtifact,
  dataObjForCharacterNew,
  dataObjForWeapon,
  mergeData,
  uiDataForTeam,
} from '../Formula/api'
import type { Data } from '../Formula/type'
import { getArtifactData } from '../PageTeam/CharacterDisplay/Tabs/TabTheorycraft/optimizeTc'
import { objectMap } from '../Util/Util'

type TeamDataBundle = {
  teamData: Dict<CharacterKey, Data[]>
  teamBundle: Dict<CharacterKey, CharBundle>
}

export default function useTeamData(
  mainStatAssumptionLevel = 0,
  overrideArt?: ICachedArtifact[] | Data,
  overrideWeapon?: ICachedWeapon
): TeamData | undefined {
  const { teamId, teamCharId: overrideTeamCharId } =
    useContext(TeamCharacterContext)
  const database = useDatabase()
  const [dbDirty, setDbDirty] = useForceUpdate()
  const dbDirtyDeferred = useDeferredValue(dbDirty)
  const { gender } = useDBMeta()
  const { teamCharIds } = useTeam(teamId) ?? { teamCharIds: [] as string[] }
  const data = useMemo(
    () =>
      dbDirtyDeferred &&
      getTeamDataCalc(
        database,
        teamId,
        gender,
        overrideTeamCharId,
        mainStatAssumptionLevel,
        overrideArt,
        overrideWeapon
      ),
    [
      dbDirtyDeferred,
      gender,
      teamId,
      database,
      mainStatAssumptionLevel,
      overrideTeamCharId,
      overrideArt,
      overrideWeapon,
    ]
  )

  useEffect(
    () => (teamId ? database.teams.follow(teamId, setDbDirty) : undefined),
    [teamId, setDbDirty, database]
  )

  useEffect(() => {
    if (!dbDirty) return () => {}
    const unfollowTeamChars = teamCharIds.map((teamCharId) => {
      const unfollowTeamChar = database.teamChars.follow(teamCharId, setDbDirty)
      const unfollowChar = database.teamChars.followChar(teamCharId, setDbDirty)
      const unfollowBuild = database.teamChars.followBuild(
        teamCharId,
        setDbDirty
      )
      return () => {
        unfollowTeamChar()
        unfollowChar()
        unfollowBuild()
      }
    })

    return () => {
      unfollowTeamChars.forEach((unfollow) => unfollow())
    }
  }, [dbDirty, database, teamCharIds, setDbDirty])

  return data
}

export function getTeamDataCalc(
  database: ArtCharDatabase,
  teamId: string | '',
  gender: GenderKey,
  overrideTeamCharId: string,
  mainStatAssumptionLevel = 0,
  overrideArt?: ICachedArtifact[] | Data,
  overrideWeapon?: ICachedWeapon
): TeamData | undefined {
  if (!teamId) return undefined
  const activeChar = database.teams.getActiveTeamChar(teamId)
  if (!activeChar) return undefined

  const { teamData, teamBundle } =
    getTeamData(
      database,
      teamId,
      overrideTeamCharId,
      mainStatAssumptionLevel,
      overrideArt,
      overrideWeapon
    ) ?? {}
  if (!teamData || !teamBundle) return undefined

  const calcData = uiDataForTeam(teamData, gender, activeChar.key)

  const data = objectMap(calcData, (obj, ck) => {
    const { data: _, ...rest } = teamBundle[ck]!
    return { ...obj, ...rest }
  })
  return data
}

export function getTeamData(
  database: ArtCharDatabase,
  teamId: string | '',
  activeTeamCharId: string,
  mainStatAssumptionLevel = 0,
  // OverrideArt/overrideWeapon is only applied to the teamchar of activeTeamCharId
  overrideArt?: ICachedArtifact[] | Data,
  overrideWeapon?: ICachedWeapon
): TeamDataBundle | undefined {
  if (!teamId) return undefined
  const team = database.teams.get(teamId)
  if (!team) return undefined
  const { teamCharIds, enemyOverride } = team
  const teamBundleArr = teamCharIds.map((teamCharId) => {
    const teamChar = database.teamChars.get(teamCharId)!
    const {
      key: characterKey,
      buildType,
      buildTcId,
      infusionAura,
      customMultiTargets,
      conditional,
      bonusStats,
      hitMode,
      reaction,
    } = teamChar
    const character = database.chars.get(characterKey)!
    const { key, level, constellation, ascension, talent } = character
    const isCurrentTeamChar = teamCharId === activeTeamCharId
    const weapon = (() => {
      if (overrideWeapon && isCurrentTeamChar) return overrideWeapon
      return database.teamChars.getLoadoutWeapon(teamCharId)
    })()
    const arts = (() => {
      if (overrideArt && isCurrentTeamChar) return overrideArt
      if (buildType === 'tc' && buildTcId)
        return getArtifactData(database.buildTcs.get(buildTcId)!)
      return Object.values(
        database.teamChars.getLoadoutArtifacts(teamCharId)
      ).filter((a) => a) as ICachedArtifact[]
    })()
    const mainLevel = (() => {
      if (mainStatAssumptionLevel && isCurrentTeamChar)
        return mainStatAssumptionLevel
      return 0
    })()

    return getCharDataBundle(
      database,
      isCurrentTeamChar, // only true for the "main character"?
      mainLevel,
      {
        key,
        level,
        constellation,
        ascension,
        talent,

        infusionAura,
        customMultiTargets,
        conditional,
        bonusStats,

        enemyOverride,
        hitMode,
        reaction,
      },
      weapon,
      arts
    )
  })
  const teamBundle = Object.fromEntries(
    (teamBundleArr.filter((b) => b) as CharBundle[]).map((bundle) => [
      bundle.character.key,
      bundle,
    ])
  )
  const teamData = objMap(teamBundle, ({ data }) => data)
  return { teamData, teamBundle }
}
type CharBundle = {
  character: ICachedCharacter
  weapon: ICachedWeapon
  characterSheet: CharacterSheet
  weaponSheet: WeaponSheet
  data: Data[]
}

function getCharDataBundle(
  database: ArtCharDatabase,
  useCustom = false,
  mainStatAssumptionLevel: number,
  charInfo: CharInfo,
  weapon: ICachedWeapon,
  artifacts: ICachedArtifact[] | Data
): CharBundle | undefined {
  const character = database.chars.get(charInfo.key)!
  const characterSheet = getCharSheet(charInfo.key, database.gender)
  if (!characterSheet) return undefined
  const weaponSheet = getWeaponSheet(weapon.key)
  if (!weaponSheet) return undefined

  const weaponSheetsDataOfType = WeaponSheet.getAllDataOfType(
    characterSheet.weaponTypeKey
  )

  const weaponSheetsData = useCustom
    ? (() => {
        // display is included in WeaponSheet.getAllDataOfType
        const { display, ...restWeaponSheetData } = weaponSheet.data
        return mergeData([restWeaponSheetData, weaponSheetsDataOfType])
      })()
    : weaponSheet.data

  const sheetData = mergeData([
    characterSheet.data,
    weaponSheetsData,
    allArtifactData,
  ])
  const artifactData = Array.isArray(artifacts)
    ? artifacts.map((a) => dataObjForArtifact(a, mainStatAssumptionLevel))
    : [artifacts]
  const data = [
    ...artifactData,
    dataObjForCharacterNew(charInfo, useCustom ? sheetData : undefined),
    dataObjForWeapon(weapon),
    sheetData,
    common, // NEED TO PUT THIS AT THE END
    resonanceData,
  ]
  return { character, weapon, characterSheet, weaponSheet, data }
}

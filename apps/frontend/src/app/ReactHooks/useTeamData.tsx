import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { objMap } from '@genshin-optimizer/common/util'
import type { CharacterKey, GenderKey } from '@genshin-optimizer/gi/consts'
import type {
  ArtCharDatabase,
  ICachedArtifact,
  ICachedCharacter,
  ICachedWeapon,
} from '@genshin-optimizer/gi/db'
import { useDBMeta, useDatabase, useTeam } from '@genshin-optimizer/gi/db-ui'
import { useContext, useDeferredValue, useEffect, useMemo } from 'react'
import type { TeamData } from '../Context/DataContext'
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
import { objectMap } from '../Util/Util'
import {
  getArtifactData,
  getWeaponData,
} from '../PageTeam/CharacterDisplay/Tabs/TabTheorycraft/optimizeTc'
import { TeamCharacterContext } from '../Context/TeamCharacterContext'

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
  const { teamCharIds } = useTeam(teamId) ?? { teamCharIds: [] }
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
    const unfollowTeamChars = teamCharIds.map((teamCharId) =>
      database.teamChars.follow(teamCharId, (_k, r, v) => {
        if (r === 'update') setDbDirty()
      })
    )
    const unfollowBuilds = teamCharIds.map((teamCharId) => {
      const teamChar = database.teamChars.get(teamCharId)
      if (!teamChar) return () => {}
      if (teamChar.buildType === 'equipped')
        return database.chars.follow(teamChar.key, () => setDbDirty())
      else if (teamChar.buildType === 'real')
        return database.builds.follow(teamChar.buildId, () => setDbDirty())
      else if (teamChar.buildType === 'tc')
        return database.buildTcs.follow(teamChar.buildTcId, () => setDbDirty())
      return () => {}
    })

    return () => {
      unfollowTeamChars.forEach((unfollow) => unfollow())
      unfollowBuilds.forEach((unfollow) => unfollow())
    }
  }, [database, teamCharIds, setDbDirty])

  return data
}

function getTeamDataCalc(
  database: ArtCharDatabase,
  teamId: string | '',
  gender: GenderKey,
  overrideTeamCharId: string,
  mainStatAssumptionLevel = 0,
  overrideArt?: ICachedArtifact[] | Data,
  overrideWeapon?: ICachedWeapon
): TeamData | undefined {
  if (!teamId) return undefined
  const team = database.teams.get(teamId)
  if (!team) return undefined
  const { teamCharIds } = team
  const active = database.teamChars.get(teamCharIds[0])
  if (!active) return undefined

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

  const calcData = uiDataForTeam(teamData, gender, active.key)

  const data = objectMap(calcData, (obj, ck) => {
    const { data: _, ...rest } = teamBundle[ck]!
    return { ...obj, ...rest }
  })
  return data
}

export function getTeamData(
  database: ArtCharDatabase,
  teamId: string | '',
  overrideTeamCharId: string,
  mainStatAssumptionLevel = 0,
  overrideArt?: ICachedArtifact[] | Data,
  overrideWeapon?: ICachedWeapon
): TeamDataBundle | undefined {
  if (!teamId) return undefined
  const team = database.teams.get(teamId)
  if (!team) return undefined
  const { teamCharIds, enemyOverride, hitMode, reaction } = team

  const teamBundleArr = teamCharIds.map((id, ind) => {
    const teamChar = database.teamChars.get(id)
    const {
      key: characterKey,
      buildType,
      buildTcId,
      infusionAura,
      customMultiTargets,
      conditional,
      bonusStats,
    } = teamChar
    const character = database.chars.get(characterKey)
    const { key, level, constellation, ascension, talent } = character
    let tempOverrideWeapon = overrideWeapon
    let tempOverrideArt = overrideArt
    let tempMainStatAssumptionLevel = mainStatAssumptionLevel
    if (id !== overrideTeamCharId) {
      tempOverrideWeapon = undefined
      tempOverrideArt = undefined
      tempMainStatAssumptionLevel = 0
    }
    if (buildType === 'tc' && buildTcId) {
      const buildTc = database.buildTcs.get(buildTcId)
      tempOverrideArt = getArtifactData(buildTc)
      tempOverrideWeapon = getWeaponData(buildTc)
    }
    return getCharDataBundle(
      database,
      id === overrideTeamCharId, // only true for the "main character"?
      tempMainStatAssumptionLevel,
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
      tempOverrideWeapon
        ? tempOverrideWeapon
        : database.teamChars.getLoadoutWeapon(id),
      tempOverrideArt ??
        (Object.values(database.teamChars.getLoadoutArtifacts(id)).filter(
          (a) => a
        ) as ICachedArtifact[])
    )
  })
  const teamBundle = Object.fromEntries(
    teamBundleArr.map((bundle) => [bundle.character.key, bundle])
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
  const character = database.chars.get(charInfo.key)
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

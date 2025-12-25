import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { notEmpty, objMap } from '@genshin-optimizer/common/util'
import type { CharacterKey, GenderKey } from '@genshin-optimizer/gi/consts'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import {
  type ArtCharDatabase,
  type ICachedArtifact,
  type ICachedCharacter,
  type ICachedWeapon,
} from '@genshin-optimizer/gi/db'
import {
  TeamCharacterContext,
  useDBMeta,
  useDatabase,
  useTeam,
} from '@genshin-optimizer/gi/db-ui'
import type { ICharacter } from '@genshin-optimizer/gi/good'
import type { CharacterSheet, WeaponSheet } from '@genshin-optimizer/gi/sheets'
import {
  allArtifactData,
  displayDataMap,
  getCharSheet,
  getWeaponSheet,
  resonanceData,
} from '@genshin-optimizer/gi/sheets'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import { uiDataForTeam } from '@genshin-optimizer/gi/uidata'
import type { CharInfo, Data } from '@genshin-optimizer/gi/wr'
import {
  common,
  dataObjForArtifact,
  dataObjForCharacterNew,
  dataObjForWeapon,
  mergeData,
} from '@genshin-optimizer/gi/wr'
import { useContext, useDeferredValue, useEffect, useMemo } from 'react'
import type { TeamData } from '../type/TeamData'
import { getBuildTcArtifactData } from '../util/getBuildTcData'

type TeamDataBundle = {
  teamData: Partial<Record<CharacterKey, Data[]>>
  teamBundle: Partial<Record<CharacterKey, CharBundle>>
}

export function useTeamData(
  mainStatAssumptionLevel = 0,
  overrideArt?: ICachedArtifact[] | Data,
  overrideWeapon?: ICachedWeapon
): TeamData | undefined {
  const { teamId, teamCharId: overrideTeamCharId } =
    useContext(TeamCharacterContext)
  return useTeamDataNoContext(
    teamId,
    overrideTeamCharId,
    mainStatAssumptionLevel,
    overrideArt,
    overrideWeapon
  )
}
export function useTeamDataNoContext(
  teamId: string,
  overrideTeamCharId: string,
  mainStatAssumptionLevel = 0,
  overrideArt?: ICachedArtifact[] | Data,
  overrideWeapon?: ICachedWeapon
): TeamData | undefined {
  const database = useDatabase()
  const [dbDirty, setDbDirty] = useForceUpdate()
  const dbDirtyDeferred = useDeferredValue(dbDirty)
  const { gender } = useDBMeta()
  const { loadoutData } = useTeam(teamId) ?? {
    loadoutData: [] as Array<LoadoutDatum | undefined>,
  }
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
    const unfollowTeamChars = loadoutData.map((loadoutDatum) => {
      if (!loadoutDatum) return () => {}
      const unfollowTeamChar = database.teamChars.follow(
        loadoutDatum.teamCharId,
        setDbDirty
      )
      const unfollowChar = database.teamChars.followChar(
        loadoutDatum.teamCharId,
        setDbDirty
      )
      const unfollowBuild = database.teams.followLoadoutDatum(
        loadoutDatum,
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
  }, [dbDirty, database, loadoutData, setDbDirty])

  return data
}

export function getTeamDataCalc(
  database: ArtCharDatabase,
  teamId: string | '',
  gender: GenderKey,
  overrideTeamCharId: string,
  mainStatAssumptionLevel = 0,
  overrideArt?: ICachedArtifact[] | Data,
  overrideWeapon?: ICachedWeapon,
  overrideChar?: Omit<ICharacter, 'key'>
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
      overrideWeapon,
      overrideChar
    ) ?? {}
  if (!teamData || !teamBundle) return undefined

  const calcData = uiDataForTeam(teamData, gender, activeChar.key)

  const data = objMap(calcData, (obj, ck) => {
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
  overrideWeapon?: ICachedWeapon,
  overrideChar?: Omit<ICharacter, 'key'>
): TeamDataBundle | undefined {
  if (!teamId) return undefined
  const team = database.teams.get(teamId)
  if (!team) return undefined
  const { loadoutData, enemyOverride, conditional: teamConditional } = team
  const teamBundleArr = loadoutData
    .map((loadoutDatum) => {
      if (!loadoutDatum) return undefined
      const { teamCharId, buildType, buildTcId } = loadoutDatum
      const teamChar = database.teamChars.get(teamCharId)
      if (!teamChar) return undefined
      const {
        key: characterKey,
        infusionAura,
        customMultiTargets,
        conditional,
        bonusStats,
        hitMode,
        reaction,
      } = teamChar
      const dbChar = database.chars.get(characterKey)
      if (!dbChar) return undefined

      const isActiveTeamChar = teamCharId === activeTeamCharId

      let char: Omit<ICharacter, 'key'> = dbChar
      if (overrideChar && isActiveTeamChar) char = overrideChar
      // tcbuild override
      else if (buildType === 'tc' && buildTcId) {
        const tcchar = database.buildTcs.get(buildTcId)!.character
        if (tcchar) char = tcchar
      }

      const { level, constellation, ascension, talent } = char

      const weapon = (() => {
        if (overrideWeapon && isActiveTeamChar) return overrideWeapon
        return database.teams.getLoadoutWeapon(loadoutDatum)
      })()
      const arts = (() => {
        if (overrideArt && isActiveTeamChar) return overrideArt
        if (buildType === 'tc' && buildTcId)
          return getBuildTcArtifactData(database.buildTcs.get(buildTcId)!)
        return Object.values(
          database.teams.getLoadoutArtifacts(loadoutDatum)
        ).filter(notEmpty) as ICachedArtifact[]
      })()
      const mainLevel = (() => {
        if (mainStatAssumptionLevel && isActiveTeamChar)
          return mainStatAssumptionLevel
        return 0
      })()

      return getCharDataBundle(
        database,
        isActiveTeamChar, // only true for the "main character"?
        mainLevel,
        {
          key: characterKey,
          level,
          constellation,
          ascension,
          talent,

          infusionAura,
          customMultiTargets,
          conditional: { ...conditional, ...teamConditional },
          bonusStats,

          enemyOverride,
          hitMode,
          reaction,
        },
        weapon,
        arts
      )
    })
    .filter((bundle) => bundle) as CharBundle[]

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

  const weaponSheetsDataOfType =
    displayDataMap[getCharStat(charInfo.key).weaponType]

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

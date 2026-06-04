import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { ArtCharDatabase, LoadoutDatum } from '@genshin-optimizer/gi/db'

export const DEFAULT_TEAM_NAME = 'Team Name'

export type OptimizeContext = {
  teamId: string
  teamCharId: string
  characterKey: CharacterKey
}

export function listPlaystyleIdsForCharacter(
  database: ArtCharDatabase,
  characterKey: CharacterKey
): string[] {
  return database.teamChars.entries
    .filter(([, tc]) => tc.key === characterKey)
    .map(([id]) => id)
}

export function listTeamIdsForPlaystyle(
  database: ArtCharDatabase,
  teamCharId: string
): string[] {
  return database.teams.entries
    .filter(([, team]) =>
      team.loadoutData.some((ld) => ld?.teamCharId === teamCharId)
    )
    .map(([id]) => id)
}

function pickTeamForPlaystyle(
  database: ArtCharDatabase,
  teamIds: string[],
  teamCharId: string
): string {
  const meta = database.dbMeta.get()
  if (meta.optTeamId && teamIds.includes(meta.optTeamId)) return meta.optTeamId

  let bestId = teamIds[0]
  let bestEdit = database.teams.get(bestId)?.lastEdit ?? 0
  for (const id of teamIds) {
    const team = database.teams.get(id)
    if (!team) continue
    const onField = team.loadoutData[0]?.teamCharId === teamCharId
    if (onField) return id
    if ((team.lastEdit ?? 0) > bestEdit) {
      bestEdit = team.lastEdit
      bestId = id
    }
  }
  return bestId
}

function resolvePlaystyleId(
  database: ArtCharDatabase,
  characterKey: CharacterKey,
  preferredTeamCharId?: string
): string {
  if (preferredTeamCharId) {
    const tc = database.teamChars.get(preferredTeamCharId)
    if (tc?.key === characterKey) return preferredTeamCharId
  }

  const playstyles = listPlaystyleIdsForCharacter(database, characterKey)
  if (playstyles.length === 1) return playstyles[0]
  if (playstyles.length > 1) {
    const meta = database.dbMeta.get()
    if (
      meta.optTeamCharId &&
      playstyles.includes(meta.optTeamCharId) &&
      database.teamChars.get(meta.optTeamCharId)?.key === characterKey
    ) {
      return meta.optTeamCharId
    }
    return playstyles[0]
  }

  return database.teamChars.new(characterKey)
}

function ensurePlaystyleOnTeam(
  database: ArtCharDatabase,
  teamId: string,
  teamCharId: string,
  characterKey: CharacterKey
) {
  const team = database.teams.get(teamId)
  if (!team) return

  const inTeam = team.loadoutData.some((ld) => ld?.teamCharId === teamCharId)
  if (inTeam) return

  database.teams.set(teamId, (t) => {
    const existingSlot = t.loadoutData.findIndex(
      (ld) =>
        ld?.teamCharId &&
        database.teamChars.get(ld.teamCharId)?.key === characterKey
    )
    if (existingSlot >= 0) {
      t.loadoutData[existingSlot] = {
        ...t.loadoutData[existingSlot]!,
        teamCharId,
      }
      return
    }
    const emptySlot = t.loadoutData.findIndex((ld) => !ld)
    const slot = emptySlot >= 0 ? emptySlot : 0
    t.loadoutData[slot] = { teamCharId } as LoadoutDatum
  })
}

/**
 * Ensures team + playstyle (teamChar) exist for optimization.
 */
export function ensureOptimizeContext(
  database: ArtCharDatabase,
  {
    characterKey,
    teamCharId: preferredTeamCharId,
    teamId: preferredTeamId,
  }: {
    characterKey: CharacterKey
    teamCharId?: string
    teamId?: string
  }
): OptimizeContext {
  database.chars.getWithInitWeapon(characterKey)

  const teamCharId = resolvePlaystyleId(
    database,
    characterKey,
    preferredTeamCharId
  )

  let teamIds = listTeamIdsForPlaystyle(database, teamCharId)
  let teamId = preferredTeamId
  if (teamId && !database.teams.get(teamId)) teamId = undefined
  if (teamId && !teamIds.includes(teamId)) teamId = undefined

  if (!teamId) {
    if (teamIds.length === 1) teamId = teamIds[0]
    else if (teamIds.length > 1) {
      teamId = pickTeamForPlaystyle(database, teamIds, teamCharId)
    } else {
      teamId = database.teams.new({ name: DEFAULT_TEAM_NAME })
      database.teams.set(teamId, (team) => {
        team.loadoutData[0] = { teamCharId } as LoadoutDatum
      })
      teamIds = [teamId]
    }
  }

  ensurePlaystyleOnTeam(database, teamId, teamCharId, characterKey)

  if (!database.teams.get(teamId)) {
    teamId = database.teams.new({ name: DEFAULT_TEAM_NAME })
    database.teams.set(teamId, (team) => {
      team.loadoutData[0] = { teamCharId } as LoadoutDatum
    })
    ensurePlaystyleOnTeam(database, teamId, teamCharId, characterKey)
  }

  database.dbMeta.set({
    optCharKey: characterKey,
    optTeamCharId: teamCharId,
    optTeamId: teamId,
  })

  return { teamId, teamCharId, characterKey }
}

export function getOptimizeCanonicalPath({
  teamId,
  characterKey,
}: OptimizeContext): string {
  return `/experiment/${teamId}/${characterKey}/optimize`
}

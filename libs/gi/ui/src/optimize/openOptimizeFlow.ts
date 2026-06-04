import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { ArtCharDatabase } from '@genshin-optimizer/gi/db'
import {
  ensureOptimizeContext,
  getOptimizeCanonicalPath,
} from './ensureOptimizeContext'

export function openOptimizeFlow(
  database: ArtCharDatabase,
  navigate: (path: string, options?: { replace?: boolean }) => void,
  {
    characterKey,
    teamCharId,
    teamId,
    replace = true,
  }: {
    characterKey?: CharacterKey
    teamCharId?: string
    teamId?: string
    replace?: boolean
  } = {}
) {
  const meta = database.dbMeta.get()
  const ck =
    characterKey ?? meta.optCharKey ?? database.chars.keys[0] ?? undefined
  if (!ck) {
    navigate('/experiment', replace ? { replace: true } : undefined)
    return
  }

  const resolvedTeamId =
    teamId ?? meta.optTeamId
  const validTeamId =
    resolvedTeamId && database.teams.get(resolvedTeamId)
      ? resolvedTeamId
      : undefined
  if (resolvedTeamId && !validTeamId) {
    database.dbMeta.set({ optTeamId: undefined })
  }

  const ctx = ensureOptimizeContext(database, {
    characterKey: ck,
    teamCharId: teamCharId ?? meta.optTeamCharId,
    teamId: validTeamId,
  })

  if (!database.teams.get(ctx.teamId)) {
    database.dbMeta.set({ optTeamId: undefined })
    const retry = ensureOptimizeContext(database, { characterKey: ck })
    navigate(getOptimizeCanonicalPath(retry), { replace: true })
    return
  }

  navigate(
    getOptimizeCanonicalPath(ctx),
    replace ? { replace: true } : undefined
  )
}

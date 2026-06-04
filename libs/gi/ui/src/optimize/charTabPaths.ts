import type { CharacterKey } from '@genshin-optimizer/gi/consts'

export const TEAM_CHAR_TAB_SEGMENTS = [
  'talent',
  'optimize',
  'upopt',
] as const

export type TeamCharTabSegment = (typeof TEAM_CHAR_TAB_SEGMENTS)[number]

export function isTeamCharTabSegment(
  segment: string | undefined
): segment is TeamCharTabSegment {
  return (
    !!segment &&
    (TEAM_CHAR_TAB_SEGMENTS as readonly string[]).includes(segment)
  )
}

export function getTeamCharTabPath(
  teamId: string,
  characterKey: CharacterKey,
  tab?: string
): string {
  const base = `/teams/${teamId}/${characterKey}`
  if (!tab || tab === 'overview') return base
  return `${base}/${tab}`
}

export function getExperimentTabPath(
  teamId: string,
  characterKey: CharacterKey,
  tab?: string
): string {
  const base = `/experiment/${teamId}/${characterKey}`
  if (!tab || tab === 'overview') return base
  return `${base}/${tab}`
}

export function getExperimentCanonicalPath({
  teamId,
  characterKey,
}: {
  teamId: string
  characterKey: CharacterKey
}): string {
  return getExperimentTabPath(teamId, characterKey, 'optimize')
}

export type OptimizeFlowKind = 'teams' | 'experiment'

export function getFlowCharTabPath(
  flow: OptimizeFlowKind,
  teamId: string,
  characterKey: CharacterKey,
  tab?: string
): string {
  return flow === 'experiment'
    ? getExperimentTabPath(teamId, characterKey, tab)
    : getTeamCharTabPath(teamId, characterKey, tab)
}

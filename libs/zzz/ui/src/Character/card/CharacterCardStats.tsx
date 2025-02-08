import { getUnitStr, valueString } from '@genshin-optimizer/common/util'
import type { CharacterKey, StatKey } from '@genshin-optimizer/zzz/consts'
import { useCharacter, useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { getCharacterStats } from '@genshin-optimizer/zzz/stats'
import { Box, ListItem, Typography } from '@mui/material'
import { useMemo } from 'react'
import { StatDisplay } from '../StatDisplay'

export function CharacterCardStats({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const { database } = useDatabaseContext()
  const character =
    useCharacter(characterKey) ??
    (characterKey ? database.chars.getOrCreate(characterKey) : undefined)
  const characterStats = useMemo<Record<string, number> | undefined>(() => {
    if (!character) return undefined
    return getCharacterStats(character.key, character.level, character.core)
  }, [character])

  return (
    <ListItem sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Typography flexGrow={1}>
        {characterStats && <StatsDisplay stats={characterStats} showBase />}
      </Typography>
    </ListItem>
  )
}

export function StatsDisplay({
  stats,
  showBase = false,
}: {
  stats: Record<string, number>
  showBase?: boolean
}) {
  return (
    <Box>
      {Object.entries(stats)
        .filter(([k]) => showBase || !k.endsWith('_base'))
        .map(([k, v]) => (
          <Typography
            key={k}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <StatDisplay key={k} statKey={k as StatKey} />{' '}
            <span>{valueString(v, getUnitStr(k))}</span>
          </Typography>
        ))}
    </Box>
  )
}

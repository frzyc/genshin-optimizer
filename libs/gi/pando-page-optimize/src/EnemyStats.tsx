import { CardThemed, NumberInputLazy } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allAmplifyingReactionKeys,
  allCatalyzeReactionKeys,
} from '@genshin-optimizer/gi/consts'
import type { PandoTeam } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { pandoCardSx } from '@genshin-optimizer/gi/formula-ui'
import { Box, CardContent, MenuItem, Stack, TextField } from '@mui/material'

export function EnemyStatsSection({
  characterKey,
  pandoTeam,
}: {
  characterKey: CharacterKey
  pandoTeam: PandoTeam
}) {
  const database = useDatabase()
  const set = (patch: Partial<PandoTeam>) =>
    database.pandoTeams.set(characterKey, patch)

  return (
    <CardThemed bgt="light" sx={pandoCardSx}>
      <CardContent>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <NumberInputLazy
              label="Enemy Lvl"
              value={pandoTeam.enemyLvl}
              inputProps={{ min: 1, max: 200, sx: { width: '5em' } }}
              onChange={(v) => set({ enemyLvl: v })}
            />
            <NumberInputLazy
              label="RES"
              float
              value={pandoTeam.enemyPreRes}
              inputProps={{ min: -2, max: 1, step: 0.05, sx: { width: '6em' } }}
              onChange={(v) => set({ enemyPreRes: v })}
            />
            <NumberInputLazy
              label="DEF shred"
              float
              value={pandoTeam.enemyDefRed_}
              inputProps={{ min: 0, max: 1, step: 0.05, sx: { width: '6em' } }}
              onChange={(v) => set({ enemyDefRed_: v })}
            />
            <NumberInputLazy
              label="DEF ignore"
              float
              value={pandoTeam.enemyDefIgn}
              inputProps={{ min: 0, max: 1, step: 0.05, sx: { width: '6em' } }}
              onChange={(v) => set({ enemyDefIgn: v })}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              select
              size="small"
              label="Amp"
              value={pandoTeam.amp}
              onChange={(e) => set({ amp: e.target.value as PandoTeam['amp'] })}
              sx={{ minWidth: '10em' }}
            >
              <MenuItem value="">None</MenuItem>
              {allAmplifyingReactionKeys.map((k) => (
                <MenuItem key={k} value={k}>
                  {k}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Catalyze"
              value={pandoTeam.cata}
              onChange={(e) =>
                set({ cata: e.target.value as PandoTeam['cata'] })
              }
              sx={{ minWidth: '10em' }}
            >
              <MenuItem value="">None</MenuItem>
              {allCatalyzeReactionKeys.map((k) => (
                <MenuItem key={k} value={k}>
                  {k}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Stack>
      </CardContent>
    </CardThemed>
  )
}

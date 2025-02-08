import { CardThemed } from '@genshin-optimizer/common/ui'
import { catTotal } from '@genshin-optimizer/common/util'
import {
  allAttributeKeys,
  allCharacterKeys,
  allCharacterRarityKeys,
} from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import {
  CharacterCard,
  CharacterRarityToggle,
  ElementToggle,
} from '@genshin-optimizer/zzz/ui'
import { Box, CardContent, Grid, Skeleton, TextField } from '@mui/material'
import { t } from 'i18next'
import { Suspense, useMemo } from 'react'
const columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 3 }

export default function PageCharacters() {
  const { database } = useDatabaseContext()

  const attributeTotals = useMemo(
    () =>
      catTotal(allAttributeKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck]) => {
          const attribute = getCharStat(ck).attribute
          ct[attribute].total++
          if (database.chars.keys.includes(ck)) ct[attribute].current++
        })
      ),
    [database]
  )

  const rarityTotals = useMemo(
    () =>
      catTotal(allCharacterRarityKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck]) => {
          const rarity = getCharStat(ck).rarity
          ct[rarity].total++
          if (database.chars.keys.includes(ck)) ct[rarity].current++
        })
      ),
    [database]
  )

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <CardThemed>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Grid container spacing={1}>
            <Grid item>Wengine Toggle</Grid>
            <Grid item>
              <ElementToggle
                sx={{ height: '100%' }}
                onChange={() => {}}
                value={['fire']}
                totals={attributeTotals}
                size="small"
              />
            </Grid>
            <Grid item>
              <CharacterRarityToggle
                sx={{ height: '100%' }}
                onChange={() => {}}
                value={['S']}
                totals={rarityTotals}
                size="small"
              />
            </Grid>
            <Grid item flexGrow={1} />
            <Grid item>
              <TextField
                autoFocus
                value={'term'}
                onChange={() => {}}
                label={t('characterName')}
                size="small"
                sx={{ height: '100%' }}
                InputProps={{
                  sx: { height: '100%' },
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </CardThemed>
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: '100%', minHeight: 5000 }}
          />
        }
      >
        <Grid container spacing={3} columns={columns}>
          {allCharacterKeys.map((charKey) => (
            <Grid item key={charKey} xs={1}>
              <CharacterCard characterKey={charKey} />
            </Grid>
          ))}
        </Grid>
      </Suspense>
    </Box>
  )
}

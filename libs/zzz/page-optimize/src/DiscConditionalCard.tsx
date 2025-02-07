import { CardThemed, DropdownButton } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import type {
  allDiscCondKeys,
  DiscCondKey,
  DiscSetKey,
} from '@genshin-optimizer/zzz/consts'
import { disc4PeffectSheets } from '@genshin-optimizer/zzz/consts'
import type { Stats } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { DiscSetName } from '@genshin-optimizer/zzz/ui'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  MenuItem,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import { useCharacterContext } from './CharacterContext'
import { StatsDisplay } from './StatsDisplay'

export function DiscConditionalsCard({ baseStats }: { baseStats: Stats }) {
  return (
    <CardThemed>
      <CardHeader title="Disc 4p Set Conditionals" />
      <Divider />
      <CardContent>
        <Typography>
          Conditionals only take effect when characters are equipped with the
          4p.
        </Typography>
        <Box>
          <Grid container spacing={1}>
            {Object.keys(disc4PeffectSheets).map((setKey) => (
              <Grid item xs={6} key={setKey}>
                <DiscConditionalCard
                  setKey={setKey}
                  key={setKey}
                  baseStats={baseStats}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </CardThemed>
  )
}
export function DiscConditionalCard({
  setKey,
  baseStats,
}: {
  setKey: DiscSetKey
  baseStats: Stats
}) {
  const sheet = disc4PeffectSheets[setKey]
  const character = useCharacterContext()
  const stats = useMemo(
    () =>
      character &&
      sheet?.getStats &&
      sheet.getStats(character?.conditionals, baseStats),
    [baseStats, character, sheet]
  )
  if (!sheet || !character) return null
  const { condMeta } = sheet

  return (
    <CardThemed bgt="light">
      <CardHeader title={<DiscSetName setKey={setKey} />} />
      <ConditionalToggle condMeta={condMeta} />
      {!!stats && !!Object.keys(stats).length && (
        <CardContent>
          <StatsDisplay stats={stats} />
        </CardContent>
      )}
    </CardThemed>
  )
}
export function ConditionalToggle({
  condMeta,
}: {
  condMeta: (typeof allDiscCondKeys)[DiscCondKey]
}) {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const value = character.conditionals[condMeta.key] ?? 0
  if (condMeta.max > 1)
    return (
      <DropdownButton
        fullWidth
        value={value}
        color={value ? 'success' : 'primary'}
        title={
          typeof condMeta.text === 'function'
            ? condMeta.text(value)
            : condMeta.text
        }
        sx={{ borderRadius: 0 }}
      >
        <MenuItem
          onClick={() => {
            database.chars.set(character.key, (chars) => ({
              conditionals: {
                ...chars.conditionals,
                [condMeta.key]: undefined,
              },
            }))
          }}
        >
          Clear
        </MenuItem>
        {range(condMeta.min, condMeta.max).map((i) => (
          <MenuItem
            key={i}
            value={i}
            onClick={() => {
              database.chars.set(character.key, (chars) => ({
                conditionals: {
                  ...chars.conditionals,
                  [condMeta.key]: i,
                },
              }))
            }}
          >
            {typeof condMeta.text === 'function'
              ? condMeta.text(i)
              : condMeta.text}
          </MenuItem>
        ))}
      </DropdownButton>
    )
  if (condMeta.max === 1) {
    return (
      <Button
        fullWidth
        sx={{ borderRadius: 0 }}
        color={value ? 'success' : 'primary'}
        onClick={() =>
          database.chars.set(character.key, (chars) => ({
            conditionals: {
              ...chars.conditionals,
              [condMeta.key]: +!value,
            },
          }))
        }
      >
        {/* {typeof condMeta.text === 'function'
          ? condMeta.text(value)
          : condMeta.text} */}
        {condMeta.text}
      </Button>
    )
  }
  return null
}

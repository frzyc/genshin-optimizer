import { CardThemed, ImgIcon } from '@genshin-optimizer/common/ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { disc4PeffectSheets } from '@genshin-optimizer/zzz/consts'
import { DiscSet4p, DiscSetName } from '@genshin-optimizer/zzz/ui'
import type { Stats } from '@genshin-optimizer/zzz/zood'
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import { useCharacterContext } from './CharacterContext'
import { ConditionalToggles } from './ConditionalToggle'
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
      <CardHeader
        title={<DiscSetName setKey={setKey} />}
        avatar={<ImgIcon src={discDefIcon(setKey)} size={2} />}
      />
      <Divider />
      <CardContent>
        <Typography>
          <DiscSet4p setKey={setKey} />
        </Typography>
      </CardContent>
      <ConditionalToggles condMetas={condMeta} />
      {!!stats && !!Object.keys(stats).length && (
        <CardContent>
          <StatsDisplay stats={stats} />
        </CardContent>
      )}
    </CardThemed>
  )
}

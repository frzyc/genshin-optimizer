import { isRelicSetKey, type RelicSetKey } from '@genshin-optimizer/sr/consts'
import { RelicSetAutocomplete } from '@genshin-optimizer/sr/ui'
import { Box, Grid, Stack } from '@mui/material'
import { useMemo, useState } from 'react'
import { useTeamContext } from './context'
import { RelicSheetDisplay } from './RelicSheetDisplay'

export function RelicSheetsDisplay() {
  const { team } = useTeamContext()
  const conditionals = team.conditionals
  const [relicSetKey, setRelicSetKey] = useState<RelicSetKey | ''>('')
  const relicList = useMemo(() => {
    const sets = conditionals
      .map((c) => c.sheet)
      .filter(isRelicSetKey) as RelicSetKey[]
    if (relicSetKey) sets.push(relicSetKey)
    // Make sure the currently selected set is at the front
    return [...new Set(sets)].sort((set) => (set === relicSetKey ? -1 : 1))
  }, [conditionals, relicSetKey])
  return (
    <Stack spacing={1} sx={{ pt: 1 }}>
      <RelicSetAutocomplete
        relicSetKey={relicSetKey}
        setRelicSetKey={setRelicSetKey}
        label="Search Relic Set" // TODO: translation
      />
      <Box>
        <Grid container columns={3} spacing={1}>
          {relicList.map((setKey) => (
            <Grid item xs={1} key={setKey}>
              <RelicSheetDisplay setKey={setKey} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  )
}

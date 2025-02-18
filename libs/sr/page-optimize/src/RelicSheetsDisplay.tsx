import { isRelicSetKey, type RelicSetKey } from '@genshin-optimizer/sr/consts'
import { useCharacterContext, useCharOpt } from '@genshin-optimizer/sr/db-ui'
import { RelicSheetDisplay } from '@genshin-optimizer/sr/formula-ui'
import { RelicSetAutocomplete } from '@genshin-optimizer/sr/ui'
import { Box, Grid, Stack } from '@mui/material'
import { useMemo, useState } from 'react'

export function RelicSheetsDisplay() {
  const { key: characterKey } = useCharacterContext()!
  const { conditionals } = useCharOpt(characterKey)!
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

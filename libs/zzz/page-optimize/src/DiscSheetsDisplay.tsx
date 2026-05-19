import { stableArr } from '@genshin-optimizer/common/util'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import type { TeamConditional } from '@genshin-optimizer/zzz/db'
import { isDiscSetKey } from '@genshin-optimizer/zzz/consts'
import { useCharacterContext, useTeam } from '@genshin-optimizer/zzz/db-ui'
import { DiscSheetDisplay } from '@genshin-optimizer/zzz/formula-ui'
import { DiscSetAutocomplete } from '@genshin-optimizer/zzz/ui'
import { Box, Grid, Stack } from '@mui/material'
import { useMemo, useState } from 'react'

export function DiscSheetsDisplay() {
  const { key: characterKey } = useCharacterContext()!
  const team = useTeam(characterKey)!
  const conditionals =
    team.frames[0]?.conditionals ?? stableArr<TeamConditional>()
  const [discSetKey, setDiscSetKey] = useState<DiscSetKey | ''>('')
  const discList = useMemo(() => {
    const sets = conditionals
      .map((c) => c.sheet)
      .filter(isDiscSetKey) as DiscSetKey[]
    if (discSetKey) sets.push(discSetKey)
    // Make sure the currently selected set is at the front
    return [...new Set(sets)].sort((set) => (set === discSetKey ? -1 : 1))
  }, [conditionals, discSetKey])
  return (
    <Stack spacing={1} sx={{ pt: 1 }}>
      <DiscSetAutocomplete
        discSetKey={discSetKey}
        setDiscSetKey={setDiscSetKey}
        label="Search Disc Set" // TODO: translation
      />
      <Box>
        <Grid container columns={3} spacing={1}>
          {discList.map((setKey) => (
            <Grid item xs={1} key={setKey}>
              <DiscSheetDisplay setKey={setKey} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  )
}

import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { isLightConeKey } from '@genshin-optimizer/sr/consts'
import { useCharacterContext, useCharOpt } from '@genshin-optimizer/sr/db-ui'
import { LightConeSheetDisplay } from '@genshin-optimizer/sr/formula-ui'
import { LightConeAutocomplete } from '@genshin-optimizer/sr/ui'
import { Box, Grid, Stack } from '@mui/material'
import { useMemo, useState } from 'react'

export function LightConeSheetsDisplay() {
  const { key: characterKey } = useCharacterContext()!
  const { conditionals } = useCharOpt(characterKey)!
  const [lcKey, setLcKey] = useState<LightConeKey | ''>('')
  const lcList = useMemo(() => {
    const sets = conditionals.map((c) => c.sheet).filter(isLightConeKey)
    if (lcKey) sets.push(lcKey)
    // Make sure the currently selected lc is at the front
    return [...new Set(sets)].sort((set) => (set === lcKey ? -1 : 1))
  }, [conditionals, lcKey])
  return (
    <Stack spacing={1} sx={{ pt: 1 }}>
      <LightConeAutocomplete
        lcKey={lcKey}
        setLCKey={setLcKey}
        label="Search Light Cone" // TODO: translation
      />
      <Box>
        <Grid container columns={3} spacing={1}>
          {lcList.map((setKey) => (
            <Grid item xs={1} key={setKey}>
              <LightConeSheetDisplay lcKey={setKey} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  )
}

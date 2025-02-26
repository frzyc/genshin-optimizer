import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { isWengineKey } from '@genshin-optimizer/zzz/consts'
import { useCharacterContext, useCharOpt } from '@genshin-optimizer/zzz/db-ui'
import { WengineAutocomplete } from '@genshin-optimizer/zzz/ui'
import { Box, Grid, Stack } from '@mui/material'
import { useMemo, useState } from 'react'

export function WengineSheetsDisplay() {
  const { key: characterKey } = useCharacterContext()!
  const { conditionals } = useCharOpt(characterKey)!
  const [wkey, setWkey] = useState<WengineKey | ''>('')
  const wList = useMemo(() => {
    const sets = conditionals.map((c) => c.sheet).filter(isWengineKey)
    if (wkey) sets.push(wkey)
    // Make sure the currently selected wengine is at the front
    return [...new Set(sets)].sort((set) => (set === wkey ? -1 : 1))
  }, [conditionals, wkey])
  return (
    <Stack spacing={1} sx={{ pt: 1 }}>
      <WengineAutocomplete
        wkey={wkey}
        setWKey={setWkey}
        //label="Search Wengine"
      />
      <Box>
        <Grid container columns={3} spacing={1}>
          {wList.map((wk) => (
            <Grid item xs={1} key={wk}>
              TODO: WengineSheetDisplay for {wk}
              {/* <WengineSheetDisplay lcKey={setKey} /> */}
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  )
}

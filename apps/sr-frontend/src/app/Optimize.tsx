import type { RelicSlotKey } from '@genshin-optimizer/sr-consts'
import type { ICachedRelic } from '@genshin-optimizer/sr-db'
import type { Read } from '@genshin-optimizer/sr-formula'
import { convert, selfTag } from '@genshin-optimizer/sr-formula'
import { OptimizeForNode } from '@genshin-optimizer/sr-opt'
import { useCalcContext, useDatabaseContext } from '@genshin-optimizer/sr-ui'
import { CardThemed, DropdownButton } from '@genshin-optimizer/ui-common'
import {
  Box,
  Button,
  CardContent,
  Container,
  Grid,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { useCallback, useMemo, useState } from 'react'

type Build = {
  value: number
  relicIds: string[]
}

export default function Optimize() {
  const { database } = useDatabaseContext()

  const { calc } = useCalcContext()

  // Step 1: Pick formula(s); anything that `calc.compute` can handle will work
  const [optTarget, setOptTarget] = useState<Read | undefined>(undefined)

  const relicsBySlot = useMemo(
    () =>
      database.relics.values.reduce(
        (relicsBySlot, relic) => {
          relicsBySlot[relic.slotKey].push(relic)
          return relicsBySlot
        },
        {
          head: [],
          hand: [],
          feet: [],
          body: [],
          sphere: [],
          rope: [],
        } as Record<RelicSlotKey, ICachedRelic[]>
      ),
    [database.relics.values]
  )

  const [build, setBuild] = useState<Build | undefined>(undefined)

  const optimize = useCallback(async () => {
    if (!optTarget || !calc) return
    const { results, resultsIds } = await OptimizeForNode(
      calc,
      optTarget,
      relicsBySlot
    )
    setBuild({
      value: results[0],
      relicIds: Object.values(resultsIds[0]),
    })
  }, [calc, optTarget, relicsBySlot])

  const member0 = convert(selfTag, { member: 'member0', et: 'self' })

  return (
    <Container>
      <CardThemed bgt="dark">
        <CardContent>
          <Stack>
            <Typography variant="h5">Optimize</Typography>
            <Box>
              <DropdownButton
                title={`Optimization Target${
                  optTarget ? `: ${optTarget.tag.name || optTarget.tag.q}` : ''
                }`}
              >
                {calc?.listFormulas(member0.listing.formulas).map((read) => (
                  <MenuItem
                    key={read.tag.name || read.tag.q}
                    onClick={() => setOptTarget(read)}
                  >
                    {read.tag.name || read.tag.q}
                  </MenuItem>
                ))}
              </DropdownButton>
              <Button onClick={optimize}>Optimize</Button>
            </Box>
            <Box>
              <Typography>Best: {build?.value}</Typography>
              <Grid container columns={5} gap={1}>
                {build?.relicIds.map((id) => {
                  const relic = database.relics.get(id)
                  return (
                    <Grid item xs={1}>
                      <Relic relic={relic} />
                    </Grid>
                  )
                })}
              </Grid>
            </Box>
          </Stack>
        </CardContent>
      </CardThemed>
    </Container>
  )
}

function Relic({ relic }: { relic: ICachedRelic | undefined }) {
  return (
    <Stack>
      {!relic ? (
        <Typography>Empty</Typography>
      ) : (
        <Box>
          <Typography>
            Main: {relic.mainStatKey} - {relic.mainStatVal}
          </Typography>
          {relic.substats.map((substat) => (
            <Typography key={substat.key}>
              Sub: {substat.key} - {substat.value}
            </Typography>
          ))}
        </Box>
      )}
    </Stack>
  )
}

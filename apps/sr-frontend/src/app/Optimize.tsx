import type { RelicSlotKey } from '@genshin-optimizer/sr-consts'
import { allRelicSlotKeys } from '@genshin-optimizer/sr-consts'
import type { ICachedRelic } from '@genshin-optimizer/sr-db'
import type { Read } from '@genshin-optimizer/sr-formula'
import { convert, selfTag } from '@genshin-optimizer/sr-formula'
import type { BuildResult, ProgressResult } from '@genshin-optimizer/sr-opt'
import { MAX_BUILDS, optimize } from '@genshin-optimizer/sr-opt'
import {
  EmptyRelicCard,
  RelicCard,
  useCalcContext,
  useDatabaseContext,
} from '@genshin-optimizer/sr-ui'
import { CardThemed, DropdownButton } from '@genshin-optimizer/ui-common'
import { range } from '@genshin-optimizer/util'
import {
  Box,
  Button,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { useCallback, useMemo, useState } from 'react'

export default function Optimize() {
  const { database } = useDatabaseContext()

  const { calc } = useCalcContext()

  const [numWorkers, setNumWorkers] = useState(8)
  const [progress, setProgress] = useState<ProgressResult | undefined>(
    undefined
  )

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

  const [build, setBuild] = useState<BuildResult | undefined>(undefined)

  const onOptimize = useCallback(async () => {
    if (!optTarget || !calc) return
    setProgress(undefined)
    const results = await optimize(
      calc,
      optTarget,
      relicsBySlot,
      numWorkers,
      setProgress
    )
    console.log(results)
    setBuild(results[0])
  }, [calc, numWorkers, optTarget, relicsBySlot])

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
                {calc
                  ?.listFormulas(member0.listing.formulas)
                  .map((read, index) => (
                    <MenuItem
                      key={`${index}_${read.tag.name || read.tag.q}`}
                      onClick={() => setOptTarget(read)}
                    >
                      {read.tag.name || read.tag.q}
                    </MenuItem>
                  ))}
              </DropdownButton>
              <DropdownButton title={`Num Workers: ${numWorkers}`}>
                {range(1, 16).map((n) => (
                  <MenuItem key={n} onClick={() => setNumWorkers(n)}>
                    {n} worker(s)
                  </MenuItem>
                ))}
              </DropdownButton>
              <Button onClick={onOptimize}>Optimize</Button>
            </Box>
            {progress && (
              <Box>
                <Typography>
                  Total Progress: {progress.numBuildsCompute.toLocaleString()} /{' '}
                  {Object.values(relicsBySlot)
                    .reduce((total, relics) => total * relics.length, 1)
                    .toLocaleString()}
                </Typography>
                <Typography>
                  Builds Kept: {progress.numBuilds.toLocaleString()} /{' '}
                  {MAX_BUILDS.toLocaleString()}
                </Typography>
              </Box>
            )}
            {(build || progress?.waitingForResults) && (
              <Box>
                <Typography>Best: {build?.value}</Typography>
                {progress?.waitingForResults && !build && <CircularProgress />}
                {build && (
                  <Grid container columns={3} gap={1}>
                    {allRelicSlotKeys.map((slot, index) => {
                      const id = build.ids[slot]
                      const relic = database.relics.get(id)
                      return (
                        <Grid item xs={1} key={`${index}_${id}`}>
                          {relic ? (
                            <RelicCard relic={relic} />
                          ) : (
                            <EmptyRelicCard slot={slot} />
                          )}
                        </Grid>
                      )
                    })}
                  </Grid>
                )}
              </Box>
            )}
          </Stack>
        </CardContent>
      </CardThemed>
    </Container>
  )
}

import {
  combineConst,
  compile,
  detach,
  flatten,
} from '@genshin-optimizer/pando'
import type { RelicSlotKey } from '@genshin-optimizer/sr-consts'
import { allRelicSetKeys } from '@genshin-optimizer/sr-consts'
import type { ICachedRelic } from '@genshin-optimizer/sr-db'
import type { Read, Tag } from '@genshin-optimizer/sr-formula'
import { convert, selfTag } from '@genshin-optimizer/sr-formula'
import { useCalcContext, useDatabaseContext } from '@genshin-optimizer/sr-ui'
import { getRelicMainStatVal } from '@genshin-optimizer/sr-util'
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
    // Step 2: Detach nodes from Calculator
    const relicSetKeys = new Set(allRelicSetKeys)
    let detached = detach([optTarget], calc, (tag: Tag) => {
      if (tag['member'] !== 'member0') return undefined // Wrong member
      if (tag['et'] !== 'self') return undefined // Not applied (only) to self

      if (tag['src'] === 'dyn' && tag['qt'] === 'premod')
        return { q: tag['q']! } // Art stat bonus
      if (tag['q'] === 'count' && relicSetKeys.has(tag['src'] as any))
        return { q: tag['src']! } // Art set counter
      return undefined
    })

    // Step 3: Optimize nodes, as needed
    detached = flatten(detached)
    detached = combineConst(detached)

    // Step 4: Compile for quick iteration
    const compiled = compile(
      detached,
      'q', // Tag category for object key
      6, // Number of slots
      {} // Initial values
      // Header; includes custom formulas, such as `res`
    )

    // Step 5: Calculate the value
    let best = -Infinity
    let bestIds = {} as Record<RelicSlotKey, string>
    function convertRelicToStats(relic: ICachedRelic) {
      const a = {
        [relic.mainStatKey]: getRelicMainStatVal(
          relic.rarity,
          relic.mainStatKey,
          relic.level
        ),
        ...Object.fromEntries(
          relic.substats.map((substat) => [substat.key, substat.value])
        ),
      }
      return a
    }
    relicsBySlot.head.forEach((headRelic) => {
      const headStats = convertRelicToStats(headRelic)
      relicsBySlot.hand.forEach((handRelic) => {
        const handStats = convertRelicToStats(handRelic)
        relicsBySlot.feet.forEach((feetRelic) => {
          const feetStats = convertRelicToStats(feetRelic)
          relicsBySlot.body.forEach((bodyRelic) => {
            const bodyStats = convertRelicToStats(bodyRelic)
            relicsBySlot.sphere.forEach((sphereRelic) => {
              const sphereStats = convertRelicToStats(sphereRelic)
              relicsBySlot.rope.forEach((ropeRelic) => {
                const ropeStats = convertRelicToStats(ropeRelic)
                const val = compiled([
                  headStats,
                  handStats,
                  feetStats,
                  bodyStats,
                  sphereStats,
                  ropeStats,
                ])
                if (val[0] > best) {
                  best = val[0]
                  bestIds = {
                    head: headRelic.id,
                    hand: handRelic.id,
                    feet: feetRelic.id,
                    body: bodyRelic.id,
                    sphere: sphereRelic.id,
                    rope: ropeRelic.id,
                  }
                }
              })
            })
          })
        })
      })
    })
    console.log(best)
    console.log(bestIds)
    setBuild({
      value: best,
      relicIds: Object.values(bestIds),
    })
  }, [
    calc,
    optTarget,
    relicsBySlot.body,
    relicsBySlot.feet,
    relicsBySlot.hand,
    relicsBySlot.head,
    relicsBySlot.rope,
    relicsBySlot.sphere,
  ])

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

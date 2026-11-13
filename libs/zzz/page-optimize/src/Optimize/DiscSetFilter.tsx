import { SqBadge, TwoPcBonusList } from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  objKeyMap,
  stableArr,
  type TwoPcStats,
  toggleInArr,
  twoPcSelected,
  valueString,
} from '@genshin-optimizer/common/util'
import type {
  DiscSetKey,
  DiscSlotKey,
  StatKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allDiscSetKeys,
  allDiscSlotKeys,
  discTwoPcGroups,
  discTwoPcSets,
} from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc, TeamConditional } from '@genshin-optimizer/zzz/db'
import { useCharacterContext, useTeam } from '@genshin-optimizer/zzz/db-ui'
import {
  CharCalcMockCountProvider,
  DiscSheetDisplay,
} from '@genshin-optimizer/zzz/formula-ui'
import { DiscSetName, StatDisplay } from '@genshin-optimizer/zzz/ui'
import { Box, Button, Grid, Typography } from '@mui/material'
import { useMemo, useState } from 'react'

export function DiscSetFilter({
  discBySlot,
  disabled,
  setFilter4,
  setFilter2,
  setSetFilter4,
  setSetFilter2,
}: {
  discBySlot: Record<DiscSlotKey, ICachedDisc[]>
  disabled?: boolean
  setFilter4: DiscSetKey[]
  setFilter2: DiscSetKey[]
  setSetFilter4: (setFilter4: DiscSetKey[]) => void
  setSetFilter2: (setFilter2: DiscSetKey[]) => void
}) {
  const character = useCharacterContext()
  const team = useTeam(character?.key)
  const conditionals =
    team?.frames[0]?.conditionals ?? stableArr<TeamConditional>()
  const discSetBySlot = useMemo(() => {
    const discSetBySlot: Record<
      DiscSetKey,
      Record<DiscSlotKey, number>
    > = objKeyMap(allDiscSetKeys, () => objKeyMap(allDiscSlotKeys, () => 0))

    Object.values(discBySlot).forEach((discs) =>
      discs.forEach(({ setKey, slotKey }) => discSetBySlot[setKey][slotKey]++)
    )

    return discSetBySlot
  }, [discBySlot])
  const selected2 = useMemo(
    () => twoPcSelected(setFilter2, discTwoPcSets),
    [setFilter2]
  )
  const [showAllSets, setShowAllSets] = useState(false)
  const visibleSetKeys = useMemo(() => {
    if (showAllSets) return allDiscSetKeys
    const keys = new Set<DiscSetKey>([...setFilter2, ...setFilter4])
    for (const setKey of allDiscSetKeys) {
      const counts = discSetBySlot[setKey]
      if (Object.values(counts).some((count) => count > 0)) keys.add(setKey)
    }
    return allDiscSetKeys.filter((key) => keys.has(key))
  }, [discSetBySlot, setFilter2, setFilter4, showAllSets])
  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Disc Set Config
        </Typography>
        <Button disabled={!setFilter4.length} onClick={() => setSetFilter4([])}>
          Reset 4p filter
        </Button>
        <Button disabled={!setFilter2.length} onClick={() => setSetFilter2([])}>
          Reset 2p filter
        </Button>
        <Button onClick={() => setShowAllSets((v) => !v)}>
          {showAllSets ? 'Show relevant sets' : 'Show all sets'}
        </Button>
      </Box>
      <TwoPcBonusList
        title="2-piece"
        groups={discTwoPcGroups}
        allowlist={setFilter2}
        universe={discTwoPcSets}
        onChange={setSetFilter2}
        disabled={disabled}
        label={(group) => (
          <TwoPcStatLabel stats={group.stats} setKey={group.sets[0]} />
        )}
      />

      <Box>
        {character && team && (
          <CharCalcMockCountProvider
            character={character}
            conditionals={conditionals}
          >
            <Grid container spacing={1}>
              {visibleSetKeys.map((d) => (
                <Grid item key={d} xs={1} md={2} lg={3}>
                  <AdvSetFilterDiscCard
                    numSlot={discSetBySlot[d]}
                    setKey={d}
                    setFilter4={setFilter4}
                    allowed2={selected2.has(d)}
                    setSetFilter4={setSetFilter4}
                  />
                </Grid>
              ))}
            </Grid>
          </CharCalcMockCountProvider>
        )}
      </Box>
    </>
  )
}
function AdvSetFilterDiscCard({
  numSlot,
  setKey,
  setFilter4,
  allowed2,
  setSetFilter4,
}: {
  numSlot: Record<DiscSlotKey, number>
  setKey: DiscSetKey
  setFilter4: DiscSetKey[]
  allowed2: boolean
  setSetFilter4: (setFilter4: DiscSetKey[]) => void
}) {
  const greyOut4 = !!setFilter4.length && !setFilter4.includes(setKey)
  return (
    <DiscSheetDisplay setKey={setKey} fade2={!allowed2} fade4={greyOut4}>
      <Box sx={{ display: 'flex', justifyContent: 'space-around', pb: 1 }}>
        {Object.entries(numSlot).map(([slotKey, count]) => (
          <Box key={slotKey}>
            <SqBadge color={count ? 'primary' : 'secondary'}>{count}</SqBadge>
          </Box>
        ))}
      </Box>
      <Button
        fullWidth
        sx={{ borderRadius: 0 }}
        color={
          !setFilter4.length || setFilter4.includes(setKey)
            ? 'success'
            : 'secondary'
        }
        onClick={() =>
          setSetFilter4(
            setFilter4.length ? toggleInArr([...setFilter4], setKey) : [setKey]
          )
        }
      >
        Allow 4p
      </Button>
    </DiscSheetDisplay>
  )
}

function TwoPcStatLabel({
  stats,
  setKey,
}: {
  stats?: TwoPcStats
  setKey: DiscSetKey
}) {
  if (!stats) return <DiscSetName setKey={setKey} />
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: 1,
        alignItems: 'center',
      }}
    >
      {Object.entries(stats).map(([stat, value]) => (
        <Box
          key={stat}
          component="span"
          sx={{ display: 'inline-flex', gap: 0.5, alignItems: 'center' }}
        >
          <StatDisplay statKey={stat as StatKey} showPercent />+
          {valueString(value, getUnitStr(stat))}
        </Box>
      ))}
    </Box>
  )
}

import { SqBadge } from '@genshin-optimizer/common/ui'
import {
  objKeyMap,
  stableArr,
  toggleInArr,
} from '@genshin-optimizer/common/util'
import type {
  ArtifactSetKey,
  ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactSetKeys,
  allArtifactSlotKeys,
} from '@genshin-optimizer/gi/consts'
import type {
  ICachedArtifact,
  PandoTeamConditional,
} from '@genshin-optimizer/gi/db'
import { CharacterContext, usePandoTeam } from '@genshin-optimizer/gi/db-ui'
import {
  ArtSheetDisplay,
  CharCalcMockCountProvider,
} from '@genshin-optimizer/gi/formula-ui'
import { Box, Button, ButtonGroup, Grid, Typography } from '@mui/material'
import { useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function ArtSetFilter({
  artsBySlot,
  setFilter4,
  setFilter2,
  setSetFilter4,
  setSetFilter2,
}: {
  artsBySlot: Record<ArtifactSlotKey, ICachedArtifact[]>
  disabled?: boolean
  setFilter4: ArtifactSetKey[]
  setFilter2: ArtifactSetKey[]
  setSetFilter4: (setFilter4: ArtifactSetKey[]) => void
  setSetFilter2: (setFilter2: ArtifactSetKey[]) => void
}) {
  const { t } = useTranslation('page_optimize')
  const { character } = useContext(CharacterContext)
  const pandoTeam = usePandoTeam(character.key)
  const conditionals =
    pandoTeam?.conditionals ?? stableArr<PandoTeamConditional>()
  const artSetBySlot = useMemo(() => {
    const artSetBySlot: Record<
      ArtifactSetKey,
      Record<ArtifactSlotKey, number>
    > = objKeyMap(allArtifactSetKeys, () =>
      objKeyMap(allArtifactSlotKeys, () => 0)
    )

    Object.values(artsBySlot).forEach((arts) =>
      arts.forEach(({ setKey, slotKey }) => artSetBySlot[setKey][slotKey]++)
    )

    return artSetBySlot
  }, [artsBySlot])
  const [showAllSets, setShowAllSets] = useState(false)
  const visibleSetKeys = useMemo(() => {
    if (showAllSets) return allArtifactSetKeys
    const keys = new Set<ArtifactSetKey>([...setFilter2, ...setFilter4])
    for (const setKey of allArtifactSetKeys) {
      const counts = artSetBySlot[setKey]
      if (Object.values(counts).some((count) => count > 0)) keys.add(setKey)
    }
    return allArtifactSetKeys.filter((key) => keys.has(key))
  }, [artSetBySlot, setFilter2, setFilter4, showAllSets])
  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t('artSetConfig')}
        </Typography>
        <Button disabled={!setFilter4.length} onClick={() => setSetFilter4([])}>
          {t('reset4p')}
        </Button>
        <Button disabled={!setFilter2.length} onClick={() => setSetFilter2([])}>
          {t('reset2p')}
        </Button>
        <Button onClick={() => setShowAllSets((v) => !v)}>
          {showAllSets ? t('showRelevantSets') : t('showAllSets')}
        </Button>
      </Box>
      <CharCalcMockCountProvider
        character={character}
        conditionals={conditionals}
      >
        <Grid container spacing={1}>
          {visibleSetKeys.map((d) => (
            <Grid item key={d} xs={12} sm={6} md={4} lg={3}>
              <AdvSetFilterCard
                numSlot={artSetBySlot[d]}
                setKey={d}
                setFilter4={setFilter4}
                setFilter2={setFilter2}
                setSetFilter4={setSetFilter4}
                setSetFilter2={setSetFilter2}
              />
            </Grid>
          ))}
        </Grid>
      </CharCalcMockCountProvider>
    </>
  )
}

function AdvSetFilterCard({
  numSlot,
  setKey,
  setFilter4,
  setFilter2,
  setSetFilter4,
  setSetFilter2,
}: {
  numSlot: Record<ArtifactSlotKey, number>
  setKey: ArtifactSetKey
  setFilter4: ArtifactSetKey[]
  setFilter2: ArtifactSetKey[]
  setSetFilter4: (setFilter4: ArtifactSetKey[]) => void
  setSetFilter2: (setFilter2: ArtifactSetKey[]) => void
}) {
  const { t } = useTranslation('page_optimize')
  const greyOut2 = !!setFilter2.length && !setFilter2.includes(setKey)
  const greyOut4 = !!setFilter4.length && !setFilter4.includes(setKey)
  return (
    <ArtSheetDisplay setKey={setKey} fade2={greyOut2} fade4={greyOut4}>
      <Box sx={{ display: 'flex', justifyContent: 'space-around', pb: 1 }}>
        {allArtifactSlotKeys.map((slotKey) => (
          <Box key={slotKey}>
            <SqBadge color={numSlot[slotKey] ? 'primary' : 'secondary'}>
              {numSlot[slotKey]}
            </SqBadge>
          </Box>
        ))}
      </Box>
      <ButtonGroup fullWidth size="small">
        <Button
          sx={{ borderRadius: 0 }}
          color={
            !setFilter4.length || setFilter4.includes(setKey)
              ? 'success'
              : 'secondary'
          }
          onClick={() =>
            setSetFilter4(
              setFilter4.length
                ? toggleInArr([...setFilter4], setKey)
                : [setKey]
            )
          }
        >
          {t('allow4p')}
        </Button>
        <Button
          sx={{ borderRadius: 0 }}
          color={
            !setFilter2.length || setFilter2.includes(setKey)
              ? 'success'
              : 'secondary'
          }
          onClick={() =>
            setSetFilter2(
              setFilter2.length
                ? toggleInArr([...setFilter2], setKey)
                : [setKey]
            )
          }
        >
          {t('allow2p')}
        </Button>
      </ButtonGroup>
    </ArtSheetDisplay>
  )
}

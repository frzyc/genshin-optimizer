import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import {
  InfoTooltipInline,
  SqBadge,
  TwoPcBonusList,
} from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  objKeyMap,
  stableArr,
  type TwoPcStats,
  toggleInArr,
  twoPcSelected,
  valueString,
} from '@genshin-optimizer/common/util'
import { artifactDefIcon } from '@genshin-optimizer/gi/assets'
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
import { Translate } from '@genshin-optimizer/gi/i18n'
import type { StatKey } from '@genshin-optimizer/gi/keymap'
import { getArtSetStat } from '@genshin-optimizer/gi/stats'
import { SlotIcon } from '@genshin-optimizer/gi/svgicons'
import { ArtifactSetName, StatWithUnit } from '@genshin-optimizer/gi/ui'
import {
  artifactTwoPcGroups,
  artifactTwoPcSets,
  elementalResBonus,
} from '@genshin-optimizer/gi/util'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { Box, Button, Grid, Skeleton, Typography } from '@mui/material'
import { Suspense, useContext, useMemo, useState } from 'react'
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
  const selected2 = useMemo(
    () => twoPcSelected(setFilter2, artifactTwoPcSets),
    [setFilter2]
  )
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
      <TwoPcBonusList
        title={t('twoPieceBonus')}
        groups={artifactTwoPcGroups}
        allowlist={setFilter2}
        universe={artifactTwoPcSets}
        onChange={setSetFilter2}
        label={(group) => (
          <TwoPcStatLabel stats={group.stats} setKey={group.sets[0]} />
        )}
      />
      <CharCalcMockCountProvider
        character={character}
        conditionals={conditionals}
      >
        <Grid container spacing={1} columns={{ xs: 2, lg: 3 }}>
          {visibleSetKeys.map((d) => (
            <Grid key={d} size={1}>
              <AdvSetFilterCard
                numSlot={artSetBySlot[d]}
                setKey={d}
                setFilter4={setFilter4}
                allowed2={selected2.has(d)}
                setSetFilter4={setSetFilter4}
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
  allowed2,
  setSetFilter4,
}: {
  numSlot: Record<ArtifactSlotKey, number>
  setKey: ArtifactSetKey
  setFilter4: ArtifactSetKey[]
  allowed2: boolean
  setSetFilter4: (setFilter4: ArtifactSetKey[]) => void
}) {
  const { t } = useTranslation('page_optimize')
  const greyOut4 = !!setFilter4.length && !setFilter4.includes(setKey)
  return (
    <ArtSheetDisplay
      setKey={setKey}
      fade2={!allowed2}
      fade4={greyOut4}
      header={
        <ArtifactFilterHeader
          setKey={setKey}
          numSlot={numSlot}
          fade2={!allowed2}
          fade4={greyOut4}
        />
      }
    >
      <Button
        fullWidth
        size="small"
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
        {t('allow4p')}
      </Button>
    </ArtSheetDisplay>
  )
}

function ArtifactFilterHeader({
  setKey,
  numSlot,
  fade2,
  fade4,
}: {
  setKey: ArtifactSetKey
  numSlot: Record<ArtifactSlotKey, number>
  fade2: boolean
  fade4: boolean
}) {
  const { t } = useTranslation('sheet')
  const artStat = getArtSetStat(setKey)
  return (
    <Box
      className={`grad-${Math.max(...artStat.rarities)}star`}
      sx={{ display: 'flex', width: '100%' }}
    >
      <Box
        component="img"
        src={artifactDefIcon(setKey)}
        sx={{ height: 100, width: 'auto', mx: -1 }}
      />
      <Box
        sx={{
          flexGrow: 1,
          px: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6">
          <ArtifactSetName setKey={setKey} />
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
        >
          {artStat.rarities
            .filter((rarity) => rarity >= 3)
            .map((rarity) => (
              <Box
                component="span"
                sx={{ display: 'inline-flex', alignItems: 'center' }}
                key={rarity}
              >
                {rarity} <StarRoundedIcon fontSize="inherit" />
              </Box>
            ))}
          <InfoTooltipInline
            title={
              <Suspense
                fallback={
                  <Skeleton variant="rectangular" width={300} height={200} />
                }
              >
                <Box>
                  <Box sx={{ opacity: fade2 ? 0.6 : 1 }}>
                    <Typography>
                      <SqBadge color="success">{t('2set')}</SqBadge>
                    </Typography>
                    <Typography>
                      <Translate
                        ns={`artifact_${setKey}_gen`}
                        key18="setEffects.2"
                      />
                    </Typography>
                  </Box>
                  <Box sx={{ paddingTop: 2, opacity: fade4 ? 0.6 : 1 }}>
                    <Typography>
                      <SqBadge color="success">{t('4set')}</SqBadge>
                    </Typography>
                    <Typography>
                      <Translate
                        ns={`artifact_${setKey}_gen`}
                        key18="setEffects.4"
                      />
                    </Typography>
                  </Box>
                </Box>
              </Suspense>
            }
          />
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {allArtifactSlotKeys.map((slotKey) => (
            <Typography key={slotKey} sx={{ flexGrow: 1 }} variant="subtitle2">
              <SqBadge
                sx={{ width: '100%' }}
                color={numSlot[slotKey] ? 'primary' : 'secondary'}
              >
                <SlotIcon slotKey={slotKey} iconProps={iconInlineProps} />{' '}
                {numSlot[slotKey]}
              </SqBadge>
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

function TwoPcStatLabel({
  stats,
  setKey,
}: {
  stats?: TwoPcStats
  setKey: ArtifactSetKey
}) {
  if (!stats) return <ArtifactSetName setKey={setKey} />
  const elementalRes = elementalResBonus(stats)
  if (elementalRes !== undefined)
    return <>Elemental RES +{valueString(elementalRes, '%')}</>
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
          <StatWithUnit statKey={stat as StatKey} />+
          {valueString(value, getUnitStr(stat))}
        </Box>
      ))}
    </Box>
  )
}

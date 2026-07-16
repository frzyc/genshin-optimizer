import {
  BootstrapTooltip,
  CardThemed,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { notEmpty, objKeyMap } from '@genshin-optimizer/common/util'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import type {
  ArtifactRarity,
  ArtifactSetKey,
  ArtifactSlotKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactRarityKeys,
  allArtifactSetKeys,
  allArtifactSlotKeys,
  allSubstatKeys,
  artMaxLevel,
  artSlotMainKeys,
} from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact, ICachedSubstat } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import type {
  DynStat,
  PartialBuildWitness,
  PartialBuildsData,
  SolverPartialBuild,
} from '@genshin-optimizer/gi/solver'
import { ArtifactCardNano, ArtifactCardPico } from '@genshin-optimizer/gi/ui'
import { getMainStatValue } from '@genshin-optimizer/gi/util'
import { HelpOutline } from '@mui/icons-material'
import { Box, Button, CardContent, Divider, Typography } from '@mui/material'
import { memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * The tight partial builds from the last generation: per slot, the ways to
 * fill the *other four* slots that could matter once a new artifact lands in
 * that slot. One slot's list is shown at a time, selected by its slot icon;
 * the tracked (left-out) slot renders as a blank pico card.
 */
export default function PartialBuildsCard({
  data,
}: {
  data: PartialBuildsData
}) {
  const { t } = useTranslation('page_character_optimize')
  const [selectedSlot, setSelectedSlot] = useState<ArtifactSlotKey | undefined>(
    undefined
  )
  const slots = allArtifactSlotKeys.filter((slot) => slot in data)
  const builds = selectedSlot ? data[selectedSlot] : undefined
  // The solver's min/max opt-target bounds are not tight, so they are not
  // displayed; the upper bound still makes a sensible display order.
  const sortedBuilds = useMemo(
    () => builds && [...builds].sort((a, b) => b.maxValue - a.maxValue),
    [builds]
  )
  return (
    <CardThemed bgt="light">
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography sx={{ fontWeight: 'bold' }}>
          {t('partialBuilds.title')}
        </Typography>
        {/* px matches the build rows' card padding so the slot selectors
            align with the pico-card columns below */}
        <Box display="flex" gap={0.5} px={0.5}>
          {slots.map((slot) => (
            <Box key={slot} width={48} display="flex" justifyContent="center">
              <SlotButton
                slot={slot}
                count={data[slot]?.length}
                selected={slot === selectedSlot}
                onClick={() =>
                  setSelectedSlot((s) => (s === slot ? undefined : slot))
                }
              />
            </Box>
          ))}
        </Box>
      </CardContent>
      {selectedSlot && sortedBuilds && (
        <>
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            {sortedBuilds.map((build) => (
              <PartialBuildDisplay
                key={build.artifactIds.join()}
                slot={selectedSlot}
                build={build}
              />
            ))}
          </CardContent>
        </>
      )}
    </CardThemed>
  )
}

function SlotButton({
  slot,
  count,
  selected,
  onClick,
}: {
  slot: ArtifactSlotKey
  /** `undefined` when this slot's candidate frontier overflowed */
  count: number | undefined
  selected: boolean
  onClick: () => void
}) {
  const { t } = useTranslation('page_character_optimize')
  const overflowed = count === undefined
  return (
    <BootstrapTooltip
      placement="top"
      title={overflowed ? t('partialBuilds.overflow') : ''}
    >
      <span>
        <Button
          onClick={onClick}
          disabled={overflowed}
          color={selected ? 'success' : 'secondary'}
          sx={{
            minWidth: 0,
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Box
            component="img"
            src={imgAssets.slot[slot]}
            sx={{ width: 32, height: 32, opacity: 0.85 }}
          />
          <SqBadge color={overflowed ? 'warning' : 'info'}>
            {overflowed ? '?' : count}
          </SqBadge>
        </Button>
      </span>
    </BootstrapTooltip>
  )
}

const PartialBuildDisplay = memo(function PartialBuildDisplay({
  slot,
  build,
}: {
  slot: ArtifactSlotKey
  build: SolverPartialBuild
}) {
  const database = useDatabase()
  const artifacts = useMemo(() => {
    const arts = build.artifactIds
      .map((id) => database.arts.get(id))
      .filter(notEmpty)
    return objKeyMap(allArtifactSlotKeys, (slotKey) =>
      slotKey === slot ? undefined : arts.find((a) => a.slotKey === slotKey)
    )
  }, [database, build, slot])
  return (
    <CardThemed sx={{ p: 0.5, width: 'fit-content' }}>
      <Box display="flex" gap={0.5} alignItems="center">
        {allArtifactSlotKeys.map((slotKey) => (
          <Box key={slotKey} width={48}>
            <ArtifactCardPico
              slotKey={slotKey}
              artifactObj={artifacts[slotKey]}
            />
          </Box>
        ))}
        {build.witness && <WitnessInfo slot={slot} witness={build.witness} />}
      </Box>
    </CardThemed>
  )
})

/** A question mark revealing the witness: an example artifact for which this
 * partial build becomes the best choice, and by how much. */
function WitnessInfo({
  slot,
  witness,
}: {
  slot: ArtifactSlotKey
  witness: PartialBuildWitness
}) {
  const { t } = useTranslation('page_character_optimize')
  const artifact = useMemo(
    () => reconstructWitnessArtifact(slot, witness.artifact),
    [slot, witness]
  )
  // `witness.value - witness.margin` is the best value at the witness without
  // this partial: max(the solve's optimum, the best alternative partial).
  const optimal = witness.value - witness.margin
  const pct = optimal ? (100 * witness.margin) / optimal : 0
  const pctString = `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`
  return (
    <BootstrapTooltip
      placement="right"
      title={
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            p: 1,
            width: 280,
          }}
        >
          <Typography variant="caption">
            {t('partialBuilds.witnessExample')}
          </Typography>
          {artifact && (
            <CardThemed bgt="light">
              <ArtifactCardNano artifactObj={artifact} slotKey={slot} />
            </CardThemed>
          )}
          <Typography
            color={witness.margin > 0 ? 'success.main' : 'warning.main'}
          >
            {t('partialBuilds.overOptimal', { value: pctString })}
          </Typography>
        </Box>
      }
    >
      <HelpOutline fontSize="small" sx={{ color: 'text.secondary', mx: 0.5 }} />
    </BootstrapTooltip>
  )
}

/**
 * Best-effort reconstruction of a displayable artifact from a witness's
 * `DynStat`: the set key is the strongest set-count entry, the main stat is
 * the slot-legal key closest to the main-stat value table (which also fixes
 * rarity and level), and the remaining substat keys become substats. Returns
 * `undefined` when no set key or main stat can be identified.
 */
function reconstructWitnessArtifact(
  slot: ArtifactSlotKey,
  dyn: DynStat
): ICachedArtifact | undefined {
  let setKey: ArtifactSetKey | undefined
  let setVal = 0
  for (const [k, v] of Object.entries(dyn))
    if (v > setVal && allArtifactSetKeys.includes(k as ArtifactSetKey)) {
      setKey = k as ArtifactSetKey
      setVal = v
    }
  let best:
    | { key: MainStatKey; rarity: ArtifactRarity; level: number; err: number }
    | undefined
  for (const key of artSlotMainKeys[slot]) {
    const v = dyn[key]
    if (!v) continue
    for (const rarity of allArtifactRarityKeys)
      for (let level = 0; level <= artMaxLevel[rarity]; level++) {
        const tv = getMainStatValue(key, rarity, level)
        if (!tv) continue
        const err = Math.abs(v - tv) / tv
        if (!best || err < best.err) best = { key, rarity, level, err }
      }
  }
  if (!setKey || !best) return undefined
  const mainStatKey = best.key
  const substats: ICachedSubstat[] = Object.entries(dyn)
    .filter(
      ([k, v]) =>
        v && k !== mainStatKey && allSubstatKeys.includes(k as SubstatKey)
    )
    .map(([k, v]) => {
      const value = k.endsWith('_') ? v * 100 : v
      return {
        key: k as SubstatKey,
        value,
        rolls: [value],
        efficiency: 0,
        accurateValue: value,
      }
    })
  return {
    id: `!witness-${slot}`,
    setKey,
    slotKey: slot,
    level: best.level,
    rarity: best.rarity,
    mainStatKey,
    mainStatVal: getMainStatValue(mainStatKey, best.rarity, best.level),
    location: '',
    lock: false,
    substats,
    unactivatedSubstats: undefined,
  }
}

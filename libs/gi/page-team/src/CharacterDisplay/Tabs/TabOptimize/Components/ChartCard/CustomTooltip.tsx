import {
  BootstrapTooltip,
  CardThemed,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { objKeyMap, objMap, valueString } from '@genshin-optimizer/common/util'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { GeneratedBuild, ICachedArtifact } from '@genshin-optimizer/gi/db'
import { CharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import type { Unit } from '@genshin-optimizer/gi/keymap'
import {
  ArtifactCardPico,
  ArtifactSetBadges,
  DataContext,
  WeaponCardPico,
} from '@genshin-optimizer/gi/ui'
import { input } from '@genshin-optimizer/gi/wr'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  ClickAwayListener,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback, useContext, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import type { TooltipProps } from 'recharts'
import type EnhancedPoint from './EnhancedPoint'

type CustomTooltipProps = TooltipProps<number, string> & {
  xLabel: ReactNode
  xUnit: Unit | undefined
  yLabel: ReactNode
  yUnit: Unit | undefined
  selectedPoint: EnhancedPoint | undefined
  setSelectedPoint: (pt: EnhancedPoint | undefined) => void
  addBuildToList: (build: GeneratedBuild) => void
}
export default function CustomTooltip({
  xLabel,
  xUnit,
  yLabel,
  yUnit,
  selectedPoint,
  setSelectedPoint,
  addBuildToList,
  ...tooltipProps
}: CustomTooltipProps) {
  const database = useDatabase()
  const { data } = useContext(DataContext)
  const { t } = useTranslation('page_character_optimize')
  const {
    character: { equippedArtifacts, equippedWeapon },
  } = useContext(CharacterContext)
  const artifactsBySlot: Record<ArtifactSlotKey, ICachedArtifact | undefined> =
    useMemo(
      () =>
        selectedPoint?.build?.artifactIds &&
        objMap(selectedPoint.build.artifactIds, (id) => database.arts.get(id)),
      [database.arts, selectedPoint]
    ) ?? objKeyMap(allArtifactSlotKeys, () => undefined)
  const clickAwayHandler = useCallback(
    (e) => {
      if (
        !(
          e.target.id.includes('customShape') ||
          e.target.id.includes('chartContainer')
        )
      ) {
        setSelectedPoint(undefined)
      }
    },
    [setSelectedPoint]
  )

  const currentlyEquipped =
    equippedWeapon === selectedPoint?.build?.weaponId &&
    allArtifactSlotKeys.every(
      (slotKey) => artifactsBySlot[slotKey]?.id === equippedArtifacts[slotKey]
    )

  const activeBuild =
    data.get(input.weapon.id).value?.toString() ===
      selectedPoint?.build?.weaponId &&
    artifactsBySlot &&
    allArtifactSlotKeys.every(
      (slotKey) =>
        artifactsBySlot[slotKey]?.id ===
        data.get(input.art[slotKey].id).value?.toString()
    )

  const generLabel = useMemo(
    () =>
      selectedPoint?.generBuildNumber !== undefined &&
      `#${selectedPoint?.generBuildNumber}`,
    [selectedPoint]
  )
  const graphLabel = useMemo(
    () =>
      selectedPoint?.graphBuildNumber !== undefined && (
        <Trans
          t={t}
          i18nKey="graphBuildLabel"
          count={selectedPoint?.graphBuildNumber}
        >
          Graph #{{ count: selectedPoint?.graphBuildNumber + 1 }}
        </Trans>
      ),
    [selectedPoint, t]
  )

  if (!tooltipProps.active || !selectedPoint) return null
  return (
    <ClickAwayListener onClickAway={clickAwayHandler}>
      <CardThemed
        sx={{ minWidth: '400px', maxWidth: '400px', p: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box>
          <Stack gap={1}>
            <Stack direction="row" alignItems="start" gap={1}>
              <Stack spacing={0.5} flexGrow={99}>
                {currentlyEquipped && (
                  <SqBadge color="info">
                    <strong>{t('currentlyEquippedBuild')}</strong>
                  </SqBadge>
                )}
                {activeBuild && (
                  <SqBadge color="success">
                    <strong>{t('activeBuild')}</strong>
                  </SqBadge>
                )}
                {generLabel && <SqBadge color="info">{generLabel}</SqBadge>}
                {graphLabel && <SqBadge color="info">{graphLabel}</SqBadge>}
                <Suspense fallback={<Skeleton width={300} height={50} />}>
                  <ArtifactSetBadges
                    artifacts={Object.values(artifactsBySlot)}
                  />
                </Suspense>
              </Stack>
              <IconButton
                onClick={() => setSelectedPoint(undefined)}
                sx={{ ml: 'auto' }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
            <Grid container direction="row" spacing={0.75} columns={6}>
              {selectedPoint.build?.weaponId && (
                <Grid item xs={1}>
                  <Suspense fallback={<Skeleton width={75} height={75} />}>
                    <WeaponCardPico weaponId={selectedPoint.build.weaponId} />
                  </Suspense>
                </Grid>
              )}
              {allArtifactSlotKeys.map((key) => (
                <Grid item key={key} xs={1}>
                  <Suspense fallback={<Skeleton width={75} height={75} />}>
                    <ArtifactCardPico
                      artifactObj={artifactsBySlot[key]}
                      slotKey={key}
                    />
                  </Suspense>
                </Grid>
              ))}
            </Grid>
            <Typography>
              <strong>{xLabel}</strong>:{' '}
              {valueString(
                xUnit === '%' ? selectedPoint.x / 100 : selectedPoint.x,
                xUnit
              )}
            </Typography>
            <Typography>
              <strong>{yLabel}</strong>:{' '}
              {valueString(
                yUnit === '%' ? selectedPoint.y / 100 : selectedPoint.y,
                yUnit
              )}
            </Typography>
            <BootstrapTooltip
              title={
                selectedPoint.highlighted ? t('tcGraph.buildAlreadyInList') : ''
              }
              placement="top"
            >
              <span>
                <Button
                  sx={{ width: '100%' }}
                  disabled={selectedPoint?.graphBuildNumber !== undefined}
                  color="info"
                  onClick={() =>
                    selectedPoint.build &&
                    addBuildToList(structuredClone(selectedPoint.build))
                  }
                >
                  {t('addBuildToList')}
                </Button>
              </span>
            </BootstrapTooltip>
          </Stack>
        </Box>
      </CardThemed>
    </ClickAwayListener>
  )
}

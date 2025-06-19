import { useDataManagerValues } from '@genshin-optimizer/common/database-ui'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper, SqBadge } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import { allPathKeys } from '@genshin-optimizer/sr/consts'
import {
  OptConfigContext,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/sr/db-ui'
import { getLightConeStat } from '@genshin-optimizer/sr/stats'
import { LightConeToggle } from '@genshin-optimizer/sr/ui'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CloseIcon from '@mui/icons-material/Close'
import {
  Button,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Skeleton,
  Stack,
} from '@mui/material'
import { Box } from '@mui/system'
import { Suspense, useContext, useMemo } from 'react'
import { LightConeLevelFilter } from './LightConeLevelFilter'
export function LightConeFilter({
  numLightCone,
  disabled,
}: {
  numLightCone: number
  disabled?: boolean
}) {
  const { database } = useDatabaseContext()
  const { optConfigId, optConfig } = useContext(OptConfigContext)
  const [show, onOpen, onClose] = useBoolState()
  return (
    <CardThemed bgt="light">
      <CardContent>
        <Stack spacing={1}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}
            >
              LightCones:{' '}
              <SqBadge color={numLightCone ? 'primary' : 'error'}>
                {numLightCone}
              </SqBadge>
            </Box>
            <Button
              sx={{ flexGrow: 1 }}
              startIcon={
                optConfig.optLightCone ? (
                  <CheckBoxIcon />
                ) : (
                  <CheckBoxOutlineBlankIcon />
                )
              }
              color={optConfig.optLightCone ? 'success' : 'secondary'}
              onClick={() =>
                database.optConfigs.set(optConfigId, {
                  optLightCone: !optConfig.optLightCone,
                })
              }
            >
              Optimize LightCone
            </Button>
          </Box>
          <LightConeFilterModal show={show} onClose={onClose} />
          {/* TODO: localization */}
          <Button
            color="info"
            fullWidth
            onClick={onOpen}
            disabled={disabled || !optConfig.optLightCone}
          >
            LightCone Filter Config
          </Button>
        </Stack>
      </CardContent>
    </CardThemed>
  )
}

function LightConeFilterModal({
  show,
  onClose,
  disabled,
}: {
  show: boolean
  onClose: () => void
  disabled?: boolean
}) {
  const { database } = useDatabaseContext()
  const { optConfigId, optConfig } = useContext(OptConfigContext)
  return (
    <ModalWrapper open={show} onClose={onClose}>
      <CardThemed>
        <CardHeader
          title="LightCone Filter"
          action={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <Suspense fallback={<Skeleton width="100%" height={'500px'} />}>
            <Stack spacing={1}>
              <LightConeLevelFilter disabled={disabled} />
              <SpecialitySelector disabled={disabled} />
              <Button
                disabled={disabled}
                onClick={() =>
                  database.optConfigs.set(optConfigId, {
                    useEquippedLightCone: !optConfig.useEquippedLightCone,
                  })
                }
                color={optConfig.useEquippedLightCone ? 'success' : 'secondary'}
              >
                Use equipped LightCone
              </Button>
            </Stack>
          </Suspense>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}

function SpecialitySelector({ disabled }: { disabled?: boolean }) {
  const { database } = useDatabaseContext()
  const { optConfigId, optConfig } = useContext(OptConfigContext)
  const { lightConePaths: lcPaths } = optConfig
  const lightCones = useDataManagerValues(database.lightCones)
  const { key: characterKey } = useCharacterContext()!
  const totals = useMemo(() => {
    return optConfig.optLightCone
      ? lightCones.reduce(
          (totals, { key, level, location }) => {
            if (level < optConfig.lcLevelLow || level > optConfig.lcLevelHigh)
              return totals
            if (
              location &&
              !optConfig.useEquippedLightCone &&
              location !== characterKey
            )
              return totals
            const path = getLightConeStat(key).path
            if (!path) return totals
            totals[path]++
            return totals
          },
          objKeyMap(allPathKeys, () => 0)
        )
      : objKeyMap(allPathKeys, () => 0)
  }, [
    characterKey,
    lightCones,
    optConfig.lcLevelLow,
    optConfig.lcLevelHigh,
    optConfig.optLightCone,
    optConfig.useEquippedLightCone,
  ])
  return (
    <LightConeToggle
      onChange={(lcPaths) =>
        database.optConfigs.set(optConfigId, { lightConePaths: lcPaths })
      }
      value={lcPaths}
      disabled={disabled}
      totals={totals}
      fullWidth
    />
  )
}

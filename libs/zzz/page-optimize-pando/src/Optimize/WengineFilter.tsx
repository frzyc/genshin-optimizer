import { useDataManagerBaseDirty } from '@genshin-optimizer/common/database-ui'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper, SqBadge } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import { allSpecialityKeys } from '@genshin-optimizer/zzz/consts'
import {
  OptConfigContext,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { getWengineStat } from '@genshin-optimizer/zzz/stats'
import { WengineToggle } from '@genshin-optimizer/zzz/ui'
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
import { WengineLevelFilter } from './WengineLevelFilter'
export function WengineFilter({
  numWengine,
  disabled,
}: {
  numWengine: number
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
              Wengines:{' '}
              <SqBadge color={numWengine ? 'primary' : 'error'}>
                {numWengine}
              </SqBadge>
            </Box>
            <Button
              sx={{ flexGrow: 1 }}
              startIcon={
                optConfig.optWengine ? (
                  <CheckBoxIcon />
                ) : (
                  <CheckBoxOutlineBlankIcon />
                )
              }
              color={optConfig.optWengine ? 'success' : 'secondary'}
              onClick={() =>
                database.optConfigs.set(optConfigId, {
                  optWengine: !optConfig.optWengine,
                })
              }
            >
              Optimize Wengine
            </Button>
          </Box>
          <WengineFilterModal show={show} onClose={onClose} />
          {/* TODO: localization */}
          <Button
            color="info"
            fullWidth
            onClick={onOpen}
            disabled={disabled || !optConfig.optWengine}
          >
            Wengine Filter Config
          </Button>
        </Stack>
      </CardContent>
    </CardThemed>
  )
}

function WengineFilterModal({
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
          title="Wengine Filter"
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
              <WengineLevelFilter disabled={disabled} />
              <SpecialitySelector disabled={disabled} />
              <Button
                disabled={disabled}
                onClick={() =>
                  database.optConfigs.set(optConfigId, {
                    useEquippedWengine: !optConfig.useEquippedWengine,
                  })
                }
                color={optConfig.useEquippedWengine ? 'success' : 'secondary'}
              >
                Use equipped Wengine
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
  const { wEngineTypes } = optConfig
  const wengineDirty = useDataManagerBaseDirty(database.wengines)
  const { key: characterKey } = useCharacterContext()!
  const totals = useMemo(() => {
    return wengineDirty && optConfig.optWengine
      ? database.wengines.values.reduce(
          (totals, { key, level, location }) => {
            if (level < optConfig.levelLow || level > optConfig.levelHigh)
              return totals
            if (
              location &&
              !optConfig.useEquippedWengine &&
              location !== characterKey
            )
              return totals
            const type = getWengineStat(key).type
            if (!type) return totals
            totals[type]++
            return totals
          },
          objKeyMap(allSpecialityKeys, () => 0)
        )
      : objKeyMap(allSpecialityKeys, () => 0)
  }, [
    characterKey,
    wengineDirty,
    database.wengines,
    optConfig.levelLow,
    optConfig.levelHigh,
    optConfig.optWengine,
    optConfig.useEquippedWengine,
  ])
  return (
    <WengineToggle
      onChange={(wEngineTypes) =>
        database.optConfigs.set(optConfigId, { wEngineTypes })
      }
      value={wEngineTypes}
      disabled={disabled}
      totals={totals}
      fullWidth
    />
  )
}

import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper, SqBadge } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import type {
  DiscMainStatKey,
  DiscSetKey,
  DiscSlotKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allDiscSlotKeys,
  discSlotToMainStatKeys,
} from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import {
  OptConfigContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { DiscSetFilter, StatDisplay } from '@genshin-optimizer/zzz/ui'
import CloseIcon from '@mui/icons-material/Close'
import {
  Button,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { Suspense, useCallback, useContext } from 'react'
import { DiscLevelFilter } from './DiscLevelFilter'

export function DiscFilter({
  discsBySlot,
}: {
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>
}) {
  const [show, onOpen, onClose] = useBoolState()
  return (
    <CardThemed bgt="light">
      <CardContent>
        <Stack spacing={1}>
          <Box
            sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}
          >
            {allDiscSlotKeys.map((key) => (
              <DiscTypo key={key} discsBySlot={discsBySlot} slotKey={key} />
            ))}
          </Box>
          <DiscFilterModal
            show={show}
            onClose={onClose}
            discsBySlot={discsBySlot}
          />
          {/* TODO: localization */}
          <Button color="info" fullWidth onClick={onOpen}>
            Disc Filter Config
          </Button>
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
function DiscTypo({
  discsBySlot,
  slotKey,
}: {
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>
  slotKey: DiscSlotKey
}) {
  return (
    <Typography>
      Disc {slotKey} <SqBadge>{discsBySlot[slotKey].length}</SqBadge>
    </Typography>
  )
}

function DiscFilterModal({
  discsBySlot,
  show,
  onClose,
  disabled,
}: {
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>
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
          title="Disc Filter"
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
              <DiscLevelFilter disabled={disabled} />
              <MainStatSelector discsBySlot={discsBySlot} disabled={disabled} />
              <SetFilter disabled={disabled} />
              <Button
                disabled={disabled}
                onClick={() =>
                  database.optConfigs.set(optConfigId, {
                    useEquipped: !optConfig.useEquipped,
                  })
                }
                color={optConfig.useEquipped ? 'success' : 'secondary'}
              >
                Use equipped Discs
              </Button>
            </Stack>
          </Suspense>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}

function MainStatSelector({
  discsBySlot,
  disabled,
}: {
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>
  disabled?: boolean
}) {
  const { database } = useDatabaseContext()
  const { optConfigId, optConfig } = useContext(OptConfigContext)
  const discSlotBtns = (slotKey: '4' | '5' | '6') => {
    const mainKeysHandler = handleMultiSelect([
      ...discSlotToMainStatKeys[slotKey],
    ])
    const keysMap = {
      '4': optConfig.slot4 ?? [],
      '5': optConfig.slot5 ?? [],
      '6': optConfig.slot6 ?? [],
    } as Record<'4' | '5' | '6', DiscMainStatKey[]>
    const funcMap = {
      '4': (slot4: DiscMainStatKey[]) =>
        database.optConfigs.set(optConfigId, { slot4 }),
      '5': (slot5: DiscMainStatKey[]) =>
        database.optConfigs.set(optConfigId, { slot5 }),
      '6': (slot6: DiscMainStatKey[]) =>
        database.optConfigs.set(optConfigId, { slot6 }),
    } as Record<'4' | '5' | '6', (slots: DiscMainStatKey[]) => void>
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {discSlotToMainStatKeys[slotKey].map((key) => (
          <Button
            disabled={disabled}
            key={key}
            variant={keysMap[slotKey].includes(key) ? 'contained' : 'outlined'}
            onClick={() =>
              funcMap[slotKey](mainKeysHandler([...keysMap[slotKey]], key))
            }
          >
            <StatDisplay statKey={key} showPercent />
          </Button>
        ))}
      </Box>
    )
  }
  return (
    <CardThemed bgt="light">
      <CardContent>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <DiscTypo slotKey="1" discsBySlot={discsBySlot} />
            <DiscTypo slotKey="2" discsBySlot={discsBySlot} />
            <DiscTypo slotKey="3" discsBySlot={discsBySlot} />
          </Box>
          <DiscTypo slotKey="4" discsBySlot={discsBySlot} />
          {discSlotBtns('4')}
          <DiscTypo slotKey="5" discsBySlot={discsBySlot} />
          {discSlotBtns('5')}
          <DiscTypo slotKey="6" discsBySlot={discsBySlot} />
          {discSlotBtns('6')}
        </Stack>
      </CardContent>
    </CardThemed>
  )
}

function SetFilter({ disabled }: { disabled?: boolean }) {
  const { database } = useDatabaseContext()
  const { optConfigId, optConfig } = useContext(OptConfigContext)
  const { setFilter2 = [], setFilter4 = [] } = optConfig

  const setSetFilter2 = useCallback(
    (setFilter2: DiscSetKey[]) => {
      database.optConfigs.set(optConfigId, { setFilter2 })
    },
    [database, optConfigId]
  )
  const setSetFilter4 = useCallback(
    (setFilter4: DiscSetKey[]) => {
      database.optConfigs.set(optConfigId, { setFilter4 })
    },
    [database, optConfigId]
  )
  return (
    <DiscSetFilter
      disabled={disabled}
      setFilter2={setFilter2}
      setFilter4={setFilter4}
      setSetFilter2={setSetFilter2}
      setSetFilter4={setSetFilter4}
    />
  )
}

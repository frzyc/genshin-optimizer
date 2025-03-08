import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper, SqBadge } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import type {
  RelicCavernSetKey,
  RelicMainStatKey,
  RelicPlanarSetKey,
  RelicSlotKey,
} from '@genshin-optimizer/sr/consts'
import {
  allRelicSlotKeys,
  relicSlotToMainStatKeys,
} from '@genshin-optimizer/sr/consts'
import type { ICachedRelic } from '@genshin-optimizer/sr/db'
import {
  OptConfigContext,
  useDatabaseContext,
} from '@genshin-optimizer/sr/db-ui'
import { StatDisplay } from '@genshin-optimizer/sr/ui'
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
import { RelicLevelFilter } from './RelicLevelFilter'
import { RelicSetFilter } from './RelicSetFilter'

export function RelicFilter({
  relicsBySlot,
}: {
  relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>
}) {
  const [show, onOpen, onClose] = useBoolState()
  return (
    <CardThemed bgt="light">
      <CardContent>
        <Stack spacing={1}>
          <Box
            sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}
          >
            {allRelicSlotKeys.map((key) => (
              <RelicTypo key={key} relicsBySlot={relicsBySlot} slotKey={key} />
            ))}
          </Box>
          <RelicFilterModal
            show={show}
            onClose={onClose}
            relicsBySlot={relicsBySlot}
          />
          {/* TODO: localization */}
          <Button color="info" fullWidth onClick={onOpen}>
            Relic Filter Config
          </Button>
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
function RelicTypo({
  relicsBySlot,
  slotKey,
}: {
  relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>
  slotKey: RelicSlotKey
}) {
  return (
    <Typography>
      Relic {slotKey}{' '}
      <SqBadge color={relicsBySlot[slotKey].length ? 'primary' : 'error'}>
        {relicsBySlot[slotKey].length}
      </SqBadge>
    </Typography>
  )
}

function RelicFilterModal({
  relicsBySlot,
  show,
  onClose,
  disabled,
}: {
  relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>
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
          title="Relic Filter"
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
              <RelicLevelFilter disabled={disabled} />
              <MainStatSelector
                relicsBySlot={relicsBySlot}
                disabled={disabled}
              />
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
                Use equipped Relics
              </Button>
            </Stack>
          </Suspense>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}

function MainStatSelector({
  relicsBySlot,
  disabled,
}: {
  relicsBySlot: Record<RelicSlotKey, ICachedRelic[]>
  disabled?: boolean
}) {
  const { database } = useDatabaseContext()
  const { optConfigId, optConfig } = useContext(OptConfigContext)
  const relicSlotBtns = (slotKey: 'body' | 'feet' | 'sphere' | 'rope') => {
    const mainKeysHandler = handleMultiSelect([
      ...relicSlotToMainStatKeys[slotKey],
    ])
    const keysMap = {
      body: optConfig.slotBodyKeys ?? [],
      feet: optConfig.slotFeetKeys ?? [],
      sphere: optConfig.slotSphereKeys ?? [],
      rope: optConfig.slotRopeKeys ?? [],
    } as Record<'body' | 'feet' | 'sphere' | 'rope', RelicMainStatKey[]>
    const funcMap = {
      body: (slotBodyKeys: RelicMainStatKey[]) =>
        database.optConfigs.set(optConfigId, { slotBodyKeys }),
      feet: (slotFeetKeys: RelicMainStatKey[]) =>
        database.optConfigs.set(optConfigId, { slotFeetKeys }),
      sphere: (slotSphereKeys: RelicMainStatKey[]) =>
        database.optConfigs.set(optConfigId, { slotSphereKeys }),
      rope: (slotRopeKeys: RelicMainStatKey[]) =>
        database.optConfigs.set(optConfigId, { slotRopeKeys }),
    } as Record<
      'body' | 'feet' | 'sphere' | 'rope',
      (slots: RelicMainStatKey[]) => void
    >
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {relicSlotToMainStatKeys[slotKey].map((key) => (
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
            <RelicTypo slotKey="head" relicsBySlot={relicsBySlot} />
            <RelicTypo slotKey="hands" relicsBySlot={relicsBySlot} />
          </Box>
          <RelicTypo slotKey="body" relicsBySlot={relicsBySlot} />
          {relicSlotBtns('body')}
          <RelicTypo slotKey="feet" relicsBySlot={relicsBySlot} />
          {relicSlotBtns('feet')}
          <RelicTypo slotKey="sphere" relicsBySlot={relicsBySlot} />
          {relicSlotBtns('sphere')}
          <RelicTypo slotKey="rope" relicsBySlot={relicsBySlot} />
          {relicSlotBtns('rope')}
        </Stack>
      </CardContent>
    </CardThemed>
  )
}

function SetFilter({ disabled }: { disabled?: boolean }) {
  const { database } = useDatabaseContext()
  const { optConfigId, optConfig } = useContext(OptConfigContext)
  const { setFilter4Cavern, setFilter2Cavern, setFilter2Planar } = optConfig

  const setSetFilter2Cavern = useCallback(
    (setFilter2Cavern: RelicCavernSetKey[]) => {
      database.optConfigs.set(optConfigId, { setFilter2Cavern })
    },
    [database, optConfigId]
  )
  const setSetFilter4Cavern = useCallback(
    (setFilter4Cavern: RelicCavernSetKey[]) => {
      database.optConfigs.set(optConfigId, { setFilter4Cavern })
    },
    [database, optConfigId]
  )
  const setSetFilter2Planar = useCallback(
    (setFilter2Planar: RelicPlanarSetKey[]) => {
      database.optConfigs.set(optConfigId, { setFilter2Planar })
    },
    [database, optConfigId]
  )
  return (
    <RelicSetFilter
      disabled={disabled}
      setFilter2Cavern={setFilter2Cavern}
      setFilter4Cavern={setFilter4Cavern}
      setFilter2Planar={setFilter2Planar}
      setSetFilter2Cavern={setSetFilter2Cavern}
      setSetFilter4Cavern={setSetFilter4Cavern}
      setSetFilter2Planar={setSetFilter2Planar}
    />
  )
}

import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper, SqBadge } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  MainStatKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactSlotKeys,
  artSlotMainKeys,
} from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import { PandoOptConfigContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { pandoCardSx } from '@genshin-optimizer/gi/formula-ui'
import {
  ArtifactSlotName,
  ArtifactStatWithUnit,
} from '@genshin-optimizer/gi/ui'
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
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { Suspense, useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { ArtLevelFilter } from './ArtLevelFilter'
import { ArtSetFilter } from './ArtSetFilter'

export function ArtFilter({
  artsBySlot,
}: {
  artsBySlot: Record<ArtifactSlotKey, ICachedArtifact[]>
}) {
  const { t } = useTranslation('page_optimize')
  const [show, onOpen, onClose] = useBoolState()
  return (
    <CardThemed bgt="light" sx={pandoCardSx}>
      <CardContent>
        <Stack spacing={1}>
          <Box
            sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}
          >
            {allArtifactSlotKeys.map((key) => (
              <ArtTypo key={key} artsBySlot={artsBySlot} slotKey={key} />
            ))}
          </Box>
          <ArtFilterModal
            show={show}
            onClose={onClose}
            artsBySlot={artsBySlot}
          />
          <Button color="info" fullWidth onClick={onOpen}>
            {t('artFilterConfig')}
          </Button>
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
function ArtTypo({
  artsBySlot,
  slotKey,
}: {
  artsBySlot: Record<ArtifactSlotKey, ICachedArtifact[]>
  slotKey: ArtifactSlotKey
}) {
  return (
    <Typography>
      <ArtifactSlotName slotKey={slotKey} />{' '}
      <SqBadge color={artsBySlot[slotKey].length ? 'primary' : 'error'}>
        {artsBySlot[slotKey].length}
      </SqBadge>
    </Typography>
  )
}

function ArtFilterModal({
  artsBySlot,
  show,
  onClose,
  disabled,
}: {
  artsBySlot: Record<ArtifactSlotKey, ICachedArtifact[]>
  show: boolean
  onClose: () => void
  disabled?: boolean
}) {
  const { t } = useTranslation('page_optimize')
  const database = useDatabase()
  const { optConfigId, optConfig } = useContext(PandoOptConfigContext)
  return (
    <ModalWrapper open={show} onClose={onClose}>
      <CardThemed>
        <CardHeader
          title={t('artFilter')}
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
              <ArtLevelFilter disabled={disabled} />
              <MainStatSelector artsBySlot={artsBySlot} disabled={disabled} />
              <Button
                disabled={disabled}
                fullWidth
                startIcon={
                  optConfig.useEquipped ? (
                    <CheckBoxIcon />
                  ) : (
                    <CheckBoxOutlineBlankIcon />
                  )
                }
                onClick={() =>
                  database.pandoOptConfigs.set(optConfigId, {
                    useEquipped: !optConfig.useEquipped,
                  })
                }
                color={optConfig.useEquipped ? 'success' : 'secondary'}
              >
                {t('useEquippedArts')}
              </Button>
              <Button
                disabled={disabled}
                fullWidth
                startIcon={
                  optConfig.allowRainbow ? (
                    <CheckBoxIcon />
                  ) : (
                    <CheckBoxOutlineBlankIcon />
                  )
                }
                onClick={() =>
                  database.pandoOptConfigs.set(optConfigId, {
                    allowRainbow: !optConfig.allowRainbow,
                  })
                }
                color={optConfig.allowRainbow ? 'success' : 'secondary'}
              >
                {t('allowRainbow')}
              </Button>
              <Typography variant="body2" color="text.secondary">
                {t('allowRainbowDesc')}
              </Typography>
              <SetFilter artsBySlot={artsBySlot} disabled={disabled} />
            </Stack>
          </Suspense>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}

function MainStatSelector({
  artsBySlot,
  disabled,
}: {
  artsBySlot: Record<ArtifactSlotKey, ICachedArtifact[]>
  disabled?: boolean
}) {
  const database = useDatabase()
  const { optConfigId, optConfig } = useContext(PandoOptConfigContext)
  const slotBtns = (slotKey: 'sands' | 'goblet' | 'circlet') => {
    const mainKeysHandler = handleMultiSelect([...artSlotMainKeys[slotKey]])
    const keysMap = {
      sands: optConfig.sands ?? [],
      goblet: optConfig.goblet ?? [],
      circlet: optConfig.circlet ?? [],
    } as Record<'sands' | 'goblet' | 'circlet', MainStatKey[]>
    const funcMap = {
      sands: (sands: MainStatKey[]) =>
        database.pandoOptConfigs.set(optConfigId, { sands }),
      goblet: (goblet: MainStatKey[]) =>
        database.pandoOptConfigs.set(optConfigId, { goblet }),
      circlet: (circlet: MainStatKey[]) =>
        database.pandoOptConfigs.set(optConfigId, { circlet }),
    } as Record<'sands' | 'goblet' | 'circlet', (slots: MainStatKey[]) => void>
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {artSlotMainKeys[slotKey].map((key) => (
          <Button
            disabled={disabled}
            key={key}
            variant={keysMap[slotKey].includes(key) ? 'contained' : 'outlined'}
            onClick={() =>
              funcMap[slotKey](mainKeysHandler([...keysMap[slotKey]], key))
            }
          >
            <ArtifactStatWithUnit statKey={key} />
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
            <ArtTypo slotKey="flower" artsBySlot={artsBySlot} />
            <ArtTypo slotKey="plume" artsBySlot={artsBySlot} />
          </Box>
          <ArtTypo slotKey="sands" artsBySlot={artsBySlot} />
          {slotBtns('sands')}
          <ArtTypo slotKey="goblet" artsBySlot={artsBySlot} />
          {slotBtns('goblet')}
          <ArtTypo slotKey="circlet" artsBySlot={artsBySlot} />
          {slotBtns('circlet')}
        </Stack>
      </CardContent>
    </CardThemed>
  )
}

function SetFilter({
  artsBySlot,
  disabled,
}: {
  artsBySlot: Record<ArtifactSlotKey, ICachedArtifact[]>
  disabled?: boolean
}) {
  const database = useDatabase()
  const { optConfigId, optConfig } = useContext(PandoOptConfigContext)
  const { setFilter2 = [], setFilter4 = [] } = optConfig

  const setSetFilter2 = useCallback(
    (setFilter2: ArtifactSetKey[]) => {
      database.pandoOptConfigs.set(optConfigId, { setFilter2 })
    },
    [database, optConfigId]
  )
  const setSetFilter4 = useCallback(
    (setFilter4: ArtifactSetKey[]) => {
      database.pandoOptConfigs.set(optConfigId, { setFilter4 })
    },
    [database, optConfigId]
  )
  return (
    <ArtSetFilter
      artsBySlot={artsBySlot}
      disabled={disabled}
      setFilter2={setFilter2}
      setFilter4={setFilter4}
      setSetFilter2={setSetFilter2}
      setSetFilter4={setSetFilter4}
    />
  )
}

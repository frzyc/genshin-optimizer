'use client'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import {
  CharacterContext,
  useDatabaseContext,
  useDiscs,
  useWengine,
} from '@genshin-optimizer/zzz/db-ui'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  Tooltip,
  Typography,
} from '@mui/material'
import { Suspense, useCallback, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DiscCard, DiscSwapModal } from '../Disc'
import { WengineCard, WengineEditor } from '../Wengine'

const columns = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 3,
} as const
export function EquippedGrid({
  setDisc,
}: {
  setDisc: (slotKey: DiscSlotKey, id: string | null) => void
}) {
  const { database } = useDatabaseContext()
  const character = useContext(CharacterContext)
  const [editWengineId, setEditorWengineId] = useState('')
  const discIds = useMemo(() => {
    return objKeyMap(
      allDiscSlotKeys,
      (slotKey) => character?.equippedDiscs[slotKey]
    )
  }, [character])
  const onEditWengine = useCallback((id: string) => {
    setEditorWengineId(id)
  }, [])
  const wengine = useWengine(character?.equippedWengine)
  const discs = useDiscs(discIds)

  return (
    <Box>
      <Suspense fallback={false}>
        {editWengineId && (
          <WengineEditor
            wengineId={editWengineId}
            footer
            onClose={() => setEditorWengineId('')}
            extraButtons={<LargeWeaponSwapButton />}
          />
        )}
      </Suspense>
      <Grid
        item
        columns={columns}
        container
        spacing={1}
        sx={{ padding: '16px 8px' }}
      >
        {wengine &&
        wengine.id &&
        database.wengines.keys.includes(wengine.id) ? (
          <WengineCard
            wengineId={wengine.id}
            onEdit={() => onEditWengine(wengine.id)}
            extraButtons={<WengineSwapButton />}
          />
        ) : (
          <WeaponSwapCard />
        )}
      </Grid>
      <Grid item columns={columns} container spacing={1}>
        {!!discs &&
          Object.entries(discs).map(([slotKey, disc]) => (
            <Grid item xs={1} key={disc?.id || slotKey}>
              {disc?.id && database.discs.keys.includes(disc.id) ? (
                <DiscCard
                  disc={disc}
                  extraButtons={
                    <DiscSwapButtonButton
                      disc={disc}
                      slotKey={slotKey}
                      onChangeId={(id) => setDisc(slotKey, id)}
                    />
                  }
                  onLockToggle={() =>
                    database.discs.set(disc.id, ({ lock }) => ({ lock: !lock }))
                  }
                />
              ) : (
                <DiscSwapCard
                  slotKey={slotKey}
                  onChangeId={(id) => setDisc(slotKey, id)}
                />
              )}
            </Grid>
          ))}
      </Grid>
    </Box>
  )
}

export function WeaponSwapCard() {
  return (
    <CardThemed
      bgt="light"
      sx={{
        height: '100%',
        width: '100%',
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        Swap modal
        <Button color="info" sx={{ borderRadius: '1em' }}>
          <SwapHorizIcon sx={{ height: 100, width: 100 }} />
        </Button>
      </Box>
    </CardThemed>
  )
}

export function DiscSwapCard({
  slotKey,
  onChangeId,
}: {
  slotKey: DiscSlotKey
  onChangeId: (id: string | null) => void
}) {
  const [show, onOpen, onClose] = useBoolState()
  const { t } = useTranslation('disc')
  return (
    <CardThemed
      bgt="light"
      sx={{
        height: '100%',
        width: '100%',
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent>
        <Typography>{t(`slotName`, { slotKey: slotKey })}</Typography>
      </CardContent>
      <Divider />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <DiscSwapModal
          disc={undefined}
          slotKey={slotKey}
          show={show}
          onClose={onClose}
          onChangeId={onChangeId}
        />
        <Button onClick={onOpen} color="info" sx={{ borderRadius: '1em' }}>
          <SwapHorizIcon sx={{ height: 100, width: 100 }} />
        </Button>
      </Box>
    </CardThemed>
  )
}
function DiscSwapButtonButton({
  disc,
  slotKey,
  onChangeId,
}: {
  disc: ICachedDisc
  slotKey: DiscSlotKey
  onChangeId: (id: string | null) => void
}) {
  const { t } = useTranslation('page_characters')
  const [show, onOpen, onClose] = useBoolState()
  return (
    <>
      <Tooltip
        title={<Typography>{t('tabEquip.swapArt')}</Typography>}
        placement="top"
        arrow
      >
        <Button color="info" size="small" onClick={onOpen}>
          <SwapHorizIcon />
        </Button>
      </Tooltip>
      <DiscSwapModal
        disc={disc}
        slotKey={slotKey}
        show={show}
        onClose={onClose}
        onChangeId={onChangeId}
      />
    </>
  )
}

function WengineSwapButton() {
  const { t } = useTranslation('page_characters')

  return (
    <Tooltip
      title={<Typography>{t('tabEquip.swapWengine')}</Typography>}
      placement="top"
      arrow
    >
      <Button color="info" size="small">
        <SwapHorizIcon />
      </Button>
    </Tooltip>
  )
}

function LargeWeaponSwapButton() {
  const { t } = useTranslation('page_characters')
  return (
    <Button color="info" startIcon={<SwapHorizIcon />}>
      {t('tabEquip.swapWeapon')}
    </Button>
  )
}

'use client'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import { ImgIcon } from '@genshin-optimizer/common/ui'
import { specialityDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSlotKey, SpecialityKey } from '@genshin-optimizer/zzz/consts'
import { allSpecialityKeys } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import {
  CharacterContext,
  useDatabaseContext,
  useDisc,
  useDiscs,
  useWengine,
} from '@genshin-optimizer/zzz/db-ui'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { Suspense, useCallback, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ZCard } from '../Components'
import { DiscCard, DiscEditor, DiscSwapModal } from '../Disc'
import { WengineCard, WengineEditor, WengineSwapModal } from '../Wengine'

const columns = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 3,
} as const
export function EquippedGrid({
  setWengine,
  setDisc,
}: {
  setWengine: (id: string) => void
  setDisc: (slotKey: DiscSlotKey, id: string | null) => void
}) {
  const { database } = useDatabaseContext()
  const character = useContext(CharacterContext)
  const [discIdToEdit, setDiscIdToEdit] = useState<string | undefined>()
  const [editWengineId, setEditorWengineId] = useState('')
  const onEditWengine = useCallback((id: string) => {
    setEditorWengineId(id)
  }, [])
  const onEditDisc = useCallback((id: string) => {
    setDiscIdToEdit(id)
  }, [])

  const wengine = useWengine(character?.equippedWengine)
  const characterType = character
    ? getCharStat(character.key).specialty
    : allSpecialityKeys[0]
  const discs = useDiscs(character?.equippedDiscs)
  const disc = useDisc(discIdToEdit)

  return (
    <Box>
      <Stack spacing={2}>
        <Suspense fallback={false}>
          {editWengineId && (
            <WengineEditor
              wengineId={editWengineId}
              footer
              onClose={() => setEditorWengineId('')}
              extraButtons={
                <LargeWeaponSwapButton
                  wengineId={wengine?.id || ''}
                  wengineTypeKey={characterType}
                  onChangeId={setWengine}
                />
              }
            />
          )}
        </Suspense>
        <Suspense fallback={false}>
          {disc && (
            <DiscEditor
              disc={disc}
              show={!!discIdToEdit}
              onShow={() => setDiscIdToEdit(discIdToEdit)}
              onClose={() => setDiscIdToEdit(undefined)}
              cancelEdit={() => setDiscIdToEdit(undefined)}
            />
          )}
        </Suspense>
        <Box>
          {wengine &&
          wengine.id &&
          database.wengines.keys.includes(wengine.id) ? (
            <WengineCard
              wengineId={wengine.id}
              onEdit={() => onEditWengine(wengine.id)}
              extraButtons={
                <WengineSwapButton
                  wengineId={wengine.id}
                  wengineTypeKey={characterType}
                  onChangeId={setWengine}
                />
              }
            />
          ) : (
            <WeaponSwapCard
              wengineId=""
              wengineTypeKey={characterType}
              onChangeId={setWengine}
            />
          )}
        </Box>
        <Box>
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
                      onEdit={() => onEditDisc(disc.id)}
                      onLockToggle={() =>
                        database.discs.set(disc.id, ({ lock }) => ({
                          lock: !lock,
                        }))
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
      </Stack>
    </Box>
  )
}

export function WeaponSwapCard({
  wengineId,
  wengineTypeKey,
  onChangeId,
}: {
  wengineId: string
  wengineTypeKey: SpecialityKey
  onChangeId: (id: string) => void
}) {
  const [show, onOpen, onClose] = useBoolState()
  return (
    <ZCard
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
        <Typography>
          <ImgIcon src={specialityDefIcon(wengineTypeKey)} />{' '}
        </Typography>
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
        <WengineSwapModal
          wengineId={wengineId}
          wengineTypeKey={wengineTypeKey}
          show={show}
          onClose={onClose}
          onChangeId={onChangeId}
        />
        <Button onClick={onOpen} color="info" sx={{ borderRadius: '1em' }}>
          <SwapHorizIcon sx={{ height: 100, width: 100 }} />
        </Button>
      </Box>
    </ZCard>
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
    <ZCard
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
    </ZCard>
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
        title={<Typography>{t('tabEquip.swapDisc')}</Typography>}
        placement="top"
        arrow
      >
        <Button
          color="info"
          size="small"
          onClick={onOpen}
          aria-label={t('tabEquip.swapDisc')}
        >
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

function WengineSwapButton({
  wengineId,
  wengineTypeKey,
  onChangeId,
}: {
  wengineId: string
  wengineTypeKey: SpecialityKey
  onChangeId: (id: string) => void
}) {
  const { t } = useTranslation('page_characters')

  const [show, onOpen, onClose] = useBoolState()
  return (
    <>
      <Tooltip
        title={<Typography>{t('tabEquip.swapWengine')}</Typography>}
        placement="top"
        arrow
      >
        <Button color="info" size="small" onClick={onOpen}>
          <SwapHorizIcon />
        </Button>
      </Tooltip>
      <WengineSwapModal
        wengineId={wengineId}
        wengineTypeKey={wengineTypeKey}
        onChangeId={onChangeId}
        show={show}
        onClose={onClose}
      />
    </>
  )
}

function LargeWeaponSwapButton({
  wengineId,
  wengineTypeKey,
  onChangeId,
}: {
  wengineId: string
  wengineTypeKey: SpecialityKey
  onChangeId: (id: string) => void
}) {
  const { t } = useTranslation('page_characters')
  const [show, onOpen, onClose] = useBoolState()
  return (
    <>
      <Button color="info" onClick={onOpen} startIcon={<SwapHorizIcon />}>
        {t('tabEquip.swapWengine')}
      </Button>
      <WengineSwapModal
        wengineId={wengineId}
        wengineTypeKey={wengineTypeKey}
        onChangeId={onChangeId}
        show={show}
        onClose={onClose}
      />
    </>
  )
}

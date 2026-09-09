import { useBoolState } from '@genshin-optimizer/common/react-util'
import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { CardThemed, ImgIcon } from '@genshin-optimizer/common/ui'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import {
  charKeyToLocCharKey,
  type ArtifactSlotKey,
  type WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import { CharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import { SlotIcon } from '@genshin-optimizer/gi/svgicons'
import {
  ArtifactCard,
  ArtifactEditor,
  WeaponCard,
  WeaponEditor,
} from '@genshin-optimizer/gi/ui'
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
import { Suspense, useCallback, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PandoArtifactSwapModal } from './PandoArtifactSwapModal'
import { PandoWeaponSwapModal } from './PandoWeaponSwapModal'

const columns = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 3,
} as const

export function EquippedGrid() {
  const {
    character: { key: characterKey, equippedWeapon, equippedArtifacts },
  } = useContext(CharacterContext)
  const database = useDatabase()
  const weaponTypeKey = getCharStat(characterKey).weaponType
  const weaponId = equippedWeapon
  const artifactIds = equippedArtifacts

  const [editorWeaponId, setEditorWeaponId] = useState('')
  const [artifactIdToEdit, setArtifactIdToEdit] = useState<string | undefined>()

  const setWeapon = (id: string) => {
    database.weapons.set(id, {
      location: charKeyToLocCharKey(characterKey),
    })
  }
  const setArtifact = (slotKey: ArtifactSlotKey, id: string | null) => {
    if (!id) {
      const prev = equippedArtifacts[slotKey]
      if (prev) database.arts.set(prev, { location: '' })
    } else {
      database.arts.set(id, {
        location: charKeyToLocCharKey(characterKey),
      })
    }
  }

  //triggers when character swap weapons
  if (weaponId && editorWeaponId && editorWeaponId !== weaponId)
    setEditorWeaponId(weaponId)

  const showWeapon = useCallback(
    () => weaponId && setEditorWeaponId(weaponId),
    [weaponId]
  )
  const hideWeapon = useCallback(() => setEditorWeaponId(''), [])

  return (
    <Box>
      <Suspense fallback={false}>
        <WeaponEditor
          weaponId={editorWeaponId}
          footer
          onClose={hideWeapon}
          extraButtons={
            <LargeWeaponSwapButton
              weaponId={weaponId || ''}
              weaponTypeKey={weaponTypeKey}
              onChangeId={setWeapon}
            />
          }
        />
      </Suspense>
      <Suspense fallback={false}>
        <ArtifactEditor
          artifactIdToEdit={artifactIdToEdit}
          cancelEdit={() => setArtifactIdToEdit(undefined)}
        />
      </Suspense>
      <Grid item columns={columns} container spacing={1}>
        <Grid item xs={1} display="flex" flexDirection="column">
          {weaponId ? (
            <WeaponCard
              weaponId={weaponId}
              onEdit={showWeapon}
              extraButtons={
                <WeaponSwapButton
                  weaponId={weaponId}
                  weaponTypeKey={weaponTypeKey}
                  onChangeId={setWeapon}
                />
              }
            />
          ) : (
            <WeaponSwapCard
              weaponId=""
              weaponTypeKey={weaponTypeKey}
              onChangeId={setWeapon}
            />
          )}
        </Grid>
        {!!artifactIds &&
          Object.entries(artifactIds).map(([slotKey, id]) => (
            <Grid item xs={1} key={id || slotKey}>
              {id ? (
                <ArtifactCard
                  artifactId={id}
                  extraButtons={
                    <ArtifactSwapButton
                      artifactId={id}
                      slotKey={slotKey}
                      onChangeId={(id) => setArtifact(slotKey, id)}
                    />
                  }
                  onEdit={() => setArtifactIdToEdit(id)}
                  onLockToggle={() =>
                    database.arts.set(id, ({ lock }) => ({ lock: !lock }))
                  }
                />
              ) : (
                <ArtSwapCard
                  slotKey={slotKey}
                  onChangeId={(id) => setArtifact(slotKey, id)}
                />
              )}
            </Grid>
          ))}
      </Grid>
    </Box>
  )
}

function WeaponSwapCard({
  weaponId,
  weaponTypeKey,
  onChangeId,
}: {
  weaponId: string
  weaponTypeKey: WeaponTypeKey
  onChangeId: (id: string) => void
}) {
  const { t } = useTranslation('page_weapon')
  const [show, onOpen, onClose] = useBoolState()
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
        <Typography>
          <ImgIcon src={imgAssets.weaponTypes[weaponTypeKey]} />{' '}
          {t(`weaponType.${weaponTypeKey}`)}
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
        <PandoWeaponSwapModal
          weaponId={weaponId}
          weaponTypeKey={weaponTypeKey}
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

function ArtSwapCard({
  slotKey,
  onChangeId,
}: {
  slotKey: ArtifactSlotKey
  onChangeId: (id: string | null) => void
}) {
  const [show, onOpen, onClose] = useBoolState()
  const { t } = useTranslation('artifact')
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
        <Typography>
          <SlotIcon iconProps={iconInlineProps} slotKey={slotKey} />{' '}
          {t(`slotName.${slotKey}`)}
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
        <PandoArtifactSwapModal
          artId=""
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

function ArtifactSwapButton({
  artifactId,
  slotKey,
  onChangeId,
}: {
  artifactId: string
  slotKey: ArtifactSlotKey
  onChangeId: (id: string | null) => void
}) {
  const { t } = useTranslation('page_character')
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
      <PandoArtifactSwapModal
        artId={artifactId}
        slotKey={slotKey}
        show={show}
        onClose={onClose}
        onChangeId={onChangeId}
      />
    </>
  )
}

function WeaponSwapButton({
  weaponId,
  weaponTypeKey,
  onChangeId,
}: {
  weaponId: string
  weaponTypeKey: WeaponTypeKey
  onChangeId: (id: string) => void
}) {
  const { t } = useTranslation('page_character')

  const [show, onOpen, onClose] = useBoolState()
  return (
    <>
      <Tooltip
        title={<Typography>{t('tabEquip.swapWeapon')}</Typography>}
        placement="top"
        arrow
      >
        <Button color="info" size="small" onClick={onOpen}>
          <SwapHorizIcon />
        </Button>
      </Tooltip>
      <PandoWeaponSwapModal
        weaponId={weaponId}
        weaponTypeKey={weaponTypeKey}
        onChangeId={onChangeId}
        show={show}
        onClose={onClose}
      />
    </>
  )
}

function LargeWeaponSwapButton({
  weaponId,
  weaponTypeKey,
  onChangeId,
}: {
  weaponId: string
  weaponTypeKey: WeaponTypeKey
  onChangeId: (id: string) => void
}) {
  const { t } = useTranslation('page_character')
  const [show, onOpen, onClose] = useBoolState()
  return (
    <>
      <Button color="info" onClick={onOpen} startIcon={<SwapHorizIcon />}>
        {t('tabEquip.swapWeapon')}
      </Button>
      <PandoWeaponSwapModal
        weaponId={weaponId}
        weaponTypeKey={weaponTypeKey}
        onChangeId={onChangeId}
        show={show}
        onClose={onClose}
      />
    </>
  )
}

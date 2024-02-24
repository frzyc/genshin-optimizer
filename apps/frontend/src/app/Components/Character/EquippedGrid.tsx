import { useBoolState } from '@genshin-optimizer/common/react-util'
import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import type {
  ArtifactSlotKey,
  WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { SlotIcon } from '@genshin-optimizer/gi/svgicons'
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
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ArtifactCard from '../../PageArtifact/ArtifactCard'
import WeaponCard from '../../PageWeapon/WeaponCard'
import WeaponEditor from '../../PageWeapon/WeaponEditor'
import ArtifactSwapModal from '../Artifact/ArtifactSwapModal'
import ImgIcon from '../Image/ImgIcon'
import WeaponSwapModal from '../Weapon/WeaponSwapModal'

const columns = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 3,
} as const
export default function EquippedGrid({
  weaponTypeKey,
  weaponId,
  artifactIds,
  setWeapon,
  setArtifact,
}: {
  weaponTypeKey: WeaponTypeKey
  weaponId: string
  artifactIds: Record<ArtifactSlotKey, string>
  setWeapon: (id: string) => void
  setArtifact: (slotKey: ArtifactSlotKey, id: string) => void
}) {
  const database = useDatabase()

  const [editorWeaponId, setEditorWeaponId] = useState('')

  //triggers when character swap weapons
  useEffect(() => {
    if (editorWeaponId && editorWeaponId !== weaponId)
      setEditorWeaponId(weaponId)
  }, [editorWeaponId, weaponId])

  const showWeapon = useCallback(() => setEditorWeaponId(weaponId), [weaponId])
  const hideWeapon = useCallback(() => setEditorWeaponId(''), [])

  return (
    <Box>
      <WeaponEditor
        weaponId={editorWeaponId}
        footer
        onClose={hideWeapon}
        extraButtons={
          <LargeWeaponSwapButton
            weaponTypeKey={weaponTypeKey}
            onChangeId={setWeapon}
          />
        }
      />
      <Grid item columns={columns} container spacing={1}>
        <Grid item xs={1} display="flex" flexDirection="column">
          {database.weapons.keys.includes(weaponId) ? (
            <WeaponCard
              weaponId={weaponId}
              onEdit={showWeapon}
              extraButtons={
                <WeaponSwapButton
                  weaponTypeKey={weaponTypeKey}
                  onChangeId={setWeapon}
                />
              }
            />
          ) : (
            <WeaponSwapCard
              weaponTypeKey={weaponTypeKey}
              onChangeId={setWeapon}
            />
          )}
        </Grid>
        {Object.entries(artifactIds).map(([slotKey, id]) => (
          <Grid item xs={1} key={id || slotKey}>
            {database.arts.keys.includes(id) ? (
              <ArtifactCard
                artifactId={id}
                extraButtons={
                  <ArtifactSwapButton
                    slotKey={slotKey}
                    onChangeId={(id) => setArtifact(slotKey, id)}
                  />
                }
                editorProps={{}}
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
export function WeaponSwapCard({
  weaponTypeKey,
  onChangeId,
}: {
  weaponTypeKey: WeaponTypeKey
  onChangeId: (id: string) => void
}) {
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
          {/* TODO translation */}
          {weaponTypeKey}
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
        <WeaponSwapModal
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

export function ArtSwapCard({
  slotKey,
  onChangeId,
}: {
  slotKey: ArtifactSlotKey
  onChangeId: (id: string) => void
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
        <ArtifactSwapModal
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
  slotKey,
  onChangeId,
}: {
  slotKey: ArtifactSlotKey
  onChangeId: (id: string) => void
}) {
  const { t } = useTranslation('page_character')
  const [show, onOpen, onClose] = useBoolState()
  return (
    <>
      <Tooltip
        title={<Typography>{t`tabEquip.swapArt`}</Typography>}
        placement="top"
        arrow
      >
        <Button color="info" size="small" onClick={onOpen}>
          <SwapHorizIcon />
        </Button>
      </Tooltip>
      <ArtifactSwapModal
        slotKey={slotKey}
        show={show}
        onClose={onClose}
        onChangeId={onChangeId}
      />
    </>
  )
}
function WeaponSwapButton({
  weaponTypeKey,
  onChangeId,
}: {
  weaponTypeKey: WeaponTypeKey
  onChangeId: (id: string) => void
}) {
  const { t } = useTranslation('page_character')

  const [show, onOpen, onClose] = useBoolState()
  return (
    <>
      <Tooltip
        title={<Typography>{t`tabEquip.swapWeapon`}</Typography>}
        placement="top"
        arrow
      >
        <Button color="info" size="small" onClick={onOpen}>
          <SwapHorizIcon />
        </Button>
      </Tooltip>
      <WeaponSwapModal
        weaponTypeKey={weaponTypeKey}
        onChangeId={onChangeId}
        show={show}
        onClose={onClose}
      />
    </>
  )
}
function LargeWeaponSwapButton({
  weaponTypeKey,
  onChangeId,
}: {
  weaponTypeKey: WeaponTypeKey
  onChangeId: (id: string) => void
}) {
  const { t } = useTranslation('page_character')
  const [show, onOpen, onClose] = useBoolState()
  return (
    <>
      <Button
        color="info"
        onClick={onOpen}
        startIcon={<SwapHorizIcon />}
      >{t`tabEquip.swapWeapon`}</Button>
      <WeaponSwapModal
        weaponTypeKey={weaponTypeKey}
        onChangeId={onChangeId}
        show={show}
        onClose={onClose}
      />
    </>
  )
}

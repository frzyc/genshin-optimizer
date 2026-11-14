import { useDataManagerEntries } from '@genshin-optimizer/common/database-ui'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { useDatabase, useWeapon } from '@genshin-optimizer/gi/db-ui'
import CloseIcon from '@mui/icons-material/Close'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import {
  Alert,
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
} from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BuildUsageList } from '../build/BuildUsageList'
import { WeaponName } from './WeaponTrans'

/**
 * Confirmation modal for deleting a weapon that lists the builds using it,
 * since deleting the weapon will make those builds fall back to a default weapon.
 */
export function WeaponDeleteModal({
  weaponId,
  show,
  onHide,
  onDelete,
}: {
  weaponId: string
  show: boolean
  onHide: () => void
  onDelete: () => void
}) {
  const { t } = useTranslation('page_weapon')
  const database = useDatabase()
  const weapon = useWeapon(weaponId)
  const buildEntries = useDataManagerEntries(database.builds)
  const builds = useMemo(
    () =>
      buildEntries
        .filter(([, build]) => build.weaponId === weaponId)
        .map(([, build]) => build),
    [buildEntries, weaponId]
  )
  if (!weapon) return null
  return (
    <ModalWrapper open={show} onClose={onHide}>
      <CardThemed>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <span>{t('weaponDelModal.title')}</span>
              <strong>
                <WeaponName weaponKey={weapon.key} />
              </strong>
            </Box>
          }
          action={
            <IconButton onClick={onHide}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <Alert severity="warning">
            {t('weaponDelModal.buildsAlert', { count: builds.length })}
          </Alert>
          <BuildUsageList builds={builds} />
        </CardContent>
        <Divider />
        <CardContent sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={onDelete}
          >
            {t('weaponDelModal.delBtn')}
          </Button>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}

import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper, SqBadge } from '@genshin-optimizer/common/ui'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import { PandoOptConfigContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { pandoCardSx } from '@genshin-optimizer/gi/formula-ui'
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
import { Suspense, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { WeaponLevelFilter } from './WeaponLevelFilter'

export function WeaponFilter({
  weapons,
  disabled,
}: {
  weapons: ICachedWeapon[]
  disabled?: boolean
}) {
  const { t } = useTranslation('page_optimize')
  const database = useDatabase()
  const { optConfigId, optConfig } = useContext(PandoOptConfigContext)
  const [show, onOpen, onClose] = useBoolState()
  return (
    <CardThemed bgt="light" sx={pandoCardSx}>
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
              {t('weaponFilter')}:{' '}
              <SqBadge color={weapons.length ? 'primary' : 'error'}>
                {weapons.length}
              </SqBadge>
            </Box>
            <Button
              sx={{ flexGrow: 1 }}
              startIcon={
                optConfig.optWeapon ? (
                  <CheckBoxIcon />
                ) : (
                  <CheckBoxOutlineBlankIcon />
                )
              }
              color={optConfig.optWeapon ? 'success' : 'secondary'}
              onClick={() =>
                database.pandoOptConfigs.set(optConfigId, {
                  optWeapon: !optConfig.optWeapon,
                })
              }
            >
              {t('optimizeWeapon')}
            </Button>
          </Box>
          <WeaponFilterModal
            show={show}
            onClose={onClose}
            disabled={disabled}
          />
          <Button
            color="info"
            fullWidth
            onClick={onOpen}
            disabled={disabled || !optConfig.optWeapon}
          >
            {t('weaponFilterConfig')}
          </Button>
        </Stack>
      </CardContent>
    </CardThemed>
  )
}

function WeaponFilterModal({
  show,
  onClose,
  disabled,
}: {
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
          title={t('weaponFilter')}
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
              <WeaponLevelFilter disabled={disabled} />
              <Button
                disabled={disabled}
                onClick={() =>
                  database.pandoOptConfigs.set(optConfigId, {
                    useEquippedWeapon: !optConfig.useEquippedWeapon,
                  })
                }
                color={optConfig.useEquippedWeapon ? 'success' : 'secondary'}
              >
                {t('useEquippedWeapon')}
              </Button>
            </Stack>
          </Suspense>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}

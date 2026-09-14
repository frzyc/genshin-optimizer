import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper, SqBadge } from '@genshin-optimizer/common/ui'
import { stableArr } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allWeaponKeys } from '@genshin-optimizer/gi/consts'
import type {
  ICachedWeapon,
  PandoTeamConditional,
} from '@genshin-optimizer/gi/db'
import {
  CharacterContext,
  PandoOptConfigContext,
  useDatabase,
  usePandoTeam,
} from '@genshin-optimizer/gi/db-ui'
import {
  CharCalcMockCountProvider,
  pandoCardSx,
  WeaponSheetDisplay,
} from '@genshin-optimizer/gi/formula-ui'
import { getCharStat, getWeaponStat } from '@genshin-optimizer/gi/stats'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CloseIcon from '@mui/icons-material/Close'
import {
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { Suspense, useContext, useMemo } from 'react'
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
            weapons={weapons}
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
  weapons,
  show,
  onClose,
  disabled,
}: {
  weapons: ICachedWeapon[]
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
              <WeaponCondSelector weapons={weapons} />
            </Stack>
          </Suspense>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}

function WeaponCondSelector({ weapons }: { weapons: ICachedWeapon[] }) {
  const { t } = useTranslation('page_optimize')
  const { character } = useContext(CharacterContext)
  const pandoTeam = usePandoTeam(character.key)
  const conditionals =
    pandoTeam?.conditionals ?? stableArr<PandoTeamConditional>()
  const charWeaponType = getCharStat(character.key).weaponType
  const weaponKeys = useMemo(
    () =>
      allWeaponKeys.filter(
        (key) => getWeaponStat(key).weaponType === charWeaponType
      ),
    [charWeaponType]
  )
  return (
    <Box>
      <Typography variant="h6">{t('weaponCondConfig')}</Typography>
      <Typography>{t('weaponCondMockHint')}</Typography>
      <CharCalcMockCountProvider
        character={character}
        conditionals={conditionals}
      >
        <Grid container spacing={1} columns={{ xs: 2, md: 3, lg: 4 }}>
          {weaponKeys.map((d) => (
            <Grid item key={d} xs={1}>
              <WeaponCondCard
                weaponKey={d}
                count={weapons.filter((w) => w.key === d).length}
              />
            </Grid>
          ))}
        </Grid>
      </CharCalcMockCountProvider>
    </Box>
  )
}

function getMockWeapon(key: WeaponKey) {
  return {
    key,
    level: 90,
    ascension: 6 as const,
    refinement: 1 as const,
    location: '' as const,
    lock: false,
  }
}

function WeaponCondCard({
  weaponKey,
  count,
}: {
  weaponKey: WeaponKey
  count: number
}) {
  const weapon = useMemo(() => getMockWeapon(weaponKey), [weaponKey])
  return (
    <WeaponSheetDisplay
      weapon={weapon}
      headerAction={
        <SqBadge color={count ? 'primary' : 'secondary'}>{count}</SqBadge>
      }
      fade={!count}
    />
  )
}

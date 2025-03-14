import {
  CardThemed,
  ConditionalWrapper,
  ImgIcon,
  NextImage,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import { imgAssets, weaponAsset } from '@genshin-optimizer/gi/assets'
import type {
  CharacterKey,
  LocationCharacterKey,
  WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import { useDatabase, useWeapon } from '@genshin-optimizer/gi/db-ui'
import { getWeaponSheet } from '@genshin-optimizer/gi/sheets'
import { getCharStat, getWeaponStat } from '@genshin-optimizer/gi/stats'
import { computeUIData } from '@genshin-optimizer/gi/uidata'
import { ascensionMaxLevel } from '@genshin-optimizer/gi/util'
import { dataObjForWeapon, uiInput as input } from '@genshin-optimizer/gi/wr'
import { Lock, LockOpen } from '@mui/icons-material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { GetCalcDisplay, resolveInfo } from '../../util'
import { LocationAutocomplete, LocationName } from '../character'
import { WeaponName } from './WeaponTrans'

type Props = {
  onClick?: (weaponId: string) => void
  onEdit?: (weaponId: string) => void
  onDelete?: (weaponId: string) => void
  canEquip?: boolean
  extraButtons?: JSX.Element
}
export function WeaponCard(props: Props & { weaponId: string }) {
  const { weaponId, ...rest } = props
  const weapon = useWeapon(weaponId)
  if (!weapon) return null
  return <WeaponCardObj weapon={weapon} {...rest} />
}
export function WeaponCardObj({
  weapon,
  onClick,
  onEdit,
  onDelete,
  canEquip = false,
  extraButtons,
}: Props & { weapon: ICachedWeapon }) {
  const { t } = useTranslation(['page_weapon', 'ui'])
  const database = useDatabase()
  const weaponKey = weapon?.key
  const weaponSheet = weaponKey && getWeaponSheet(weaponKey)

  const filter = useCallback(
    (ck: CharacterKey) =>
      weaponKey &&
      getWeaponStat(weaponKey).weaponType === getCharStat(ck).weaponType,
    [weaponKey],
  )

  const wrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea onClick={() => onClick?.(weapon.id)}>
        {children}
      </CardActionArea>
    ),
    [onClick, weapon.id],
  )
  const falseWrapperFunc = useCallback(
    (children: ReactNode) => <Box>{children}</Box>,
    [],
  )
  const setLocation = useCallback(
    (k: LocationCharacterKey | '') =>
      weapon.id && database.weapons.set(weapon.id, { location: k }),
    [database, weapon.id],
  )

  const UIData = useMemo(
    () =>
      weaponSheet &&
      weapon &&
      computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]),
    [weaponSheet, weapon],
  )

  if (!weapon || !weaponSheet || !UIData) return null
  const { level, ascension, refinement, id, location = '', lock } = weapon
  const weaponTypeKey = UIData.get(input.weapon.type).value! as WeaponTypeKey
  const stats = [input.weapon.main, input.weapon.sub, input.weapon.sub2].map(
    (x) => UIData.get(x),
  )
  const img = weaponAsset(weapon.key, ascension >= 2)
  const weaponStat = getWeaponStat(weapon.key)
  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangular"
          sx={{ width: '100%', height: '100%', minHeight: 300 }}
        />
      }
    >
      <CardThemed
        bgt="light"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <ConditionalWrapper
          condition={!!onClick}
          wrapper={wrapperFunc}
          falseWrapper={falseWrapperFunc}
        >
          <Box
            className={`grad-${weaponStat.rarity}star`}
            sx={{ position: 'relative', pt: 2, px: 2 }}
          >
            {!onClick && (
              <IconButton
                color="primary"
                onClick={() => database.weapons.set(id, { lock: !lock })}
                sx={{ position: 'absolute', right: 0, bottom: 0, zIndex: 2 }}
              >
                {lock ? <Lock /> : <LockOpen />}
              </IconButton>
            )}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box
                component="div"
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <ImgIcon size={2} src={imgAssets.weaponTypes[weaponTypeKey]} />
                <Typography
                  noWrap
                  sx={{
                    textAlign: 'center',
                    backgroundColor: 'rgba(100,100,100,0.35)',
                    borderRadius: '1em',
                    px: 1,
                  }}
                >
                  <strong>
                    <WeaponName weaponKey={weapon.key} />
                  </strong>
                </Typography>
              </Box>
              <Typography component="span" variant="h5">
                Lv. {level}
              </Typography>
              <Typography component="span" variant="h5" color="text.secondary">
                /{ascensionMaxLevel[ascension]}
              </Typography>
              <Typography variant="h6">
                <Trans t={t} i18nKey={'refinement'}>
                  Refinement <strong>{{ rank: refinement } as any}</strong>
                </Trans>
              </Typography>
              <StarsDisplay stars={weaponStat.rarity} colored />
            </Box>
            <Box
              sx={{ height: '100%', position: 'absolute', right: 0, top: 0 }}
            >
              <Box
                component={NextImage ? NextImage : 'img'}
                src={img ?? ''}
                width="auto"
                height="100%"
                sx={{ float: 'right' }}
              />
            </Box>
          </Box>
          <CardContent>
            {stats.map((node) => {
              const { name, icon } = resolveInfo(node.info)
              if (!name) return null
              return (
                <Box key={JSON.stringify(node.info)} sx={{ display: 'flex' }}>
                  <Typography flexGrow={1}>
                    {icon} {name}
                  </Typography>
                  <Typography>{GetCalcDisplay(node).valueString}</Typography>
                </Box>
              )
            })}
          </CardContent>
        </ConditionalWrapper>
        <Box
          sx={{
            p: 1,
            display: 'flex',
            gap: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {canEquip ? (
              <LocationAutocomplete
                location={location}
                setLocation={setLocation}
                filter={filter}
                autoCompleteProps={{
                  getOptionDisabled: (t) => !t.key,
                  disableClearable: true,
                }}
              />
            ) : (
              <LocationName location={location} />
            )}
          </Box>
          <Box
            display="flex"
            gap={1}
            alignItems="stretch"
            height="100%"
            sx={{ '& .MuiButton-root': { minWidth: 0, height: '100%' } }}
          >
            {!!onEdit && (
              <Tooltip
                title={<Typography>{t('page_weapon:edit')}</Typography>}
                placement="top"
                arrow
              >
                <Button color="info" size="small" onClick={() => onEdit(id)}>
                  <EditIcon />
                </Button>
              </Tooltip>
            )}
            {!!onDelete && (
              <Button
                color="error"
                size="small"
                onClick={() => onDelete(id)}
                disabled={!!location || lock}
              >
                <DeleteForeverIcon />
              </Button>
            )}
            {extraButtons}
          </Box>
        </Box>
      </CardThemed>
    </Suspense>
  )
}

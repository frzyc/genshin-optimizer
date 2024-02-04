import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import {
  BootstrapTooltip,
  CardThemed,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import { toPercent, unit } from '@genshin-optimizer/common/util'
import { imgAssets, weaponAsset } from '@genshin-optimizer/gi/assets'
import type { RarityKey } from '@genshin-optimizer/gi/consts'
import {
  type LocationCharacterKey,
  type MainStatKey,
  type SubstatKey,
  type WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import {
  convert,
  genshinCalculatorWithEntries,
  selfTag,
  weaponData,
} from '@genshin-optimizer/gi/formula'
import type { Weapon } from '@genshin-optimizer/gi/frontend-gql'
import {
  GetAllUserWeaponDocument,
  useRemoveWeaponMutation,
  useUpdateWeaponMutation,
} from '@genshin-optimizer/gi/frontend-gql'
import type { IWeapon } from '@genshin-optimizer/gi/good'
import { allStats } from '@genshin-optimizer/gi/stats'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import { WeaponName } from '@genshin-optimizer/gi/ui'
import { artDisplayValue, ascensionMaxLevel } from '@genshin-optimizer/gi/util'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import {
  Box,
  Button,
  CardContent,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { Suspense, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageIcon } from '../ImageIcon'
import { LocationAutocomplete } from '../LocationAutocomplete'
import LocationName from '../LocationName'
import { UserContext } from '../UserDataWrapper'
import { updateWeaponList } from '../gqlUtil'
import { assetWrapper } from '../util'

type WeaponCardProps = {
  weapon: IWeapon
  disabled?: boolean
  extraButtons?: JSX.Element
}
export function WeaponCard({
  weapon,
  disabled = false,
  extraButtons,
}: WeaponCardProps) {
  const { t: tk } = useTranslation('statKey_gen')
  const { key: weaponKey } = weapon
  const calc = useMemo(
    () => genshinCalculatorWithEntries(weaponData(weapon)),
    [weapon]
  )

  const self = convert(selfTag, { et: 'self' })
  const listing = calc
    ?.listFormulas(self.listing.specialized)
    .filter(({ tag }) => tag.src === weaponKey)
  const stats: Array<{ key: SubstatKey | MainStatKey; value: number }> = []
  const mainStatRead = listing?.find(({ tag: { qt } }) => qt === 'base')
  const mainStatVal = mainStatRead && calc ? calc.compute(mainStatRead).val : 0
  stats.push({ key: 'atk', value: mainStatVal })

  const subStatRead = listing?.find(({ tag: { qt } }) => qt === 'premod')
  const subStatVal = subStatRead && calc ? calc.compute(subStatRead).val : 0
  const subStatKey = subStatRead ? subStatRead.tag.q : ''
  if (subStatKey)
    stats.push({
      key: subStatKey as SubstatKey | MainStatKey,
      value: subStatVal,
    })
  const refStatRead = listing?.find(
    ({ tag: { qt } }) => qt === 'weaponRefinement'
  )
  const refStatVal = refStatRead && calc ? calc.compute(refStatRead).val : 0
  const refStatKey = refStatRead ? refStatRead.tag.q : ''
  if (refStatKey)
    stats.push({
      key: refStatKey as SubstatKey | MainStatKey,
      value: refStatVal,
    })

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
        }}
      >
        <Header weapon={weapon} disabled={disabled} />
        <CardContent>
          {stats.map(({ key: statKey, value }, i) => {
            return (
              <Box key={`${statKey}${i}`} sx={{ display: 'flex' }}>
                <Typography flexGrow={1}>
                  <StatIcon statKey={statKey} iconProps={iconInlineProps} />{' '}
                  {tk(statKey)}{' '}
                </Typography>
                <Typography>
                  {artDisplayValue(toPercent(value, statKey), unit(statKey))}
                  {unit(statKey)}
                </Typography>
              </Box>
            )
          })}
        </CardContent>
        <Footer
          weapon={weapon as Weapon}
          disabled={disabled}
          extraButtons={extraButtons}
        />
      </CardThemed>
    </Suspense>
  )
}

function Header({ weapon, disabled = false }: WeaponCardProps) {
  const { key, level, ascension, refinement } = weapon
  const data = allStats.weapon.data[key]
  const weaponTypeKey: WeaponTypeKey = data.weaponType
  const rarity: RarityKey = data.rarity
  return (
    <Box
      className={`grad-${rarity}star`}
      sx={{ position: 'relative', pt: 2, px: 2 }}
    >
      <LockButton weapon={weapon as Weapon} disabled={disabled} />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          component="div"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
        >
          <ImageIcon
            size={2}
            src={assetWrapper(imgAssets.weaponTypes[weaponTypeKey])}
          />
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
              <WeaponName weaponKey={key} />
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
          Refinement <strong>{refinement}</strong>
        </Typography>
        <StarsDisplay stars={rarity} colored />
      </Box>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      >
        <Image
          src={assetWrapper(weaponAsset(weapon.key, ascension >= 2))}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt=""
          style={{
            objectFit: 'contain',
            objectPosition: 'right',
          }}
        />
      </Box>
    </Box>
  )
}
function Footer({
  weapon,
  disabled,
  extraButtons,
}: {
  weapon: Weapon
  disabled: boolean
  extraButtons: ReactNode
}) {
  const { t } = useTranslation('page_weapon')
  const { lock } = weapon
  return (
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
        <Location weapon={weapon} disabled={disabled} />
      </Box>
      <Box
        display="flex"
        gap={1}
        alignItems="stretch"
        height="100%"
        sx={{ '& .MuiButton-root': { minWidth: 0, height: '100%' } }}
      >
        {/* {!!onEdit && (
          <Tooltip
            title={<Typography>{t`page_weapon:edit`}</Typography>}
            placement="top"
            arrow
          >
            <Button color="info" size="small" onClick={() => onEdit(id)}>
              <EditIcon />
            </Button>
          </Tooltip>
        )} */}
        {!disabled && (
          <BootstrapTooltip
            title={lock ? t('cantDeleteLock') : ''}
            placement="top"
          >
            <span>
              <DeleteButton weapon={weapon} />
            </span>
          </BootstrapTooltip>
        )}
        {extraButtons}
      </Box>
    </Box>
  )
}
function Location({ weapon, disabled }: { weapon: Weapon; disabled: boolean }) {
  const { id } = weapon
  const [location, setLocation] = useState(
    weapon.location as LocationCharacterKey | null
  )

  const { genshinUserId } = useContext(UserContext)
  const [
    updateWeaponMutation,
    // { data, loading, error }
  ] = useUpdateWeaponMutation({
    variables: {
      genshinUserId,
      weapon: { id, location },
    },
    update(cache, { data }) {
      const weapon = data?.updateWeapon
      if (!weapon) return
      cache.updateQuery(
        {
          query: GetAllUserWeaponDocument,
          variables: {
            genshinUserId,
          },
        },
        ({ getAllUserWeapon }) => ({
          getAllUserWeapon: updateWeaponList(getAllUserWeapon, weapon),
        })
      )
    },
  })
  useEffect(() => {
    if (weapon.location === location) return
    updateWeaponMutation()
  }, [weapon.location, location, updateWeaponMutation])
  return disabled ? (
    <LocationName location={location} />
  ) : (
    <LocationAutocomplete location={location} setLocation={setLocation} />
  )
}
function DeleteButton({ weapon }: { weapon: Weapon }) {
  const { lock, id } = weapon
  const { genshinUserId } = useContext(UserContext)
  const [removeWeaponMutation, { loading }] = useRemoveWeaponMutation({
    variables: {
      genshinUserId,
      weaponId: id,
    },
    update(cache, { data }) {
      const weapon = data?.removeWeapon
      if (!weapon) return
      cache.updateQuery(
        {
          query: GetAllUserWeaponDocument,
          variables: {
            genshinUserId,
          },
        },
        ({ getAllUserWeapon }) => ({
          getAllUserWeapon: (getAllUserWeapon as Weapon[]).filter(
            (a) => a.id !== weapon.id
          ),
        })
      )
    },
  })

  return (
    <Button
      color="error"
      size="small"
      onClick={() => removeWeaponMutation()}
      disabled={lock || loading}
    >
      <DeleteForeverIcon />
    </Button>
  )
}
function LockButton({
  weapon,
  disabled,
}: {
  weapon: Weapon
  disabled: boolean
}) {
  const { id } = weapon
  const [lock, setlock] = useState(weapon.lock)
  const { genshinUserId } = useContext(UserContext)
  const [updateWeaponMutation, { loading }] = useUpdateWeaponMutation({
    variables: {
      genshinUserId,
      weapon: { id, lock },
    },

    update(cache, { data }) {
      const weapon = data?.updateWeapon
      if (!weapon) return
      cache.updateQuery(
        {
          query: GetAllUserWeaponDocument,
          variables: {
            genshinUserId,
          },
        },
        ({ getAllUserWeapon }) => ({
          getAllUserWeapon: (getAllUserWeapon as Weapon[]).map((a) =>
            a.id === id ? { ...a, ...weapon } : a
          ),
        })
      )
    },
  })
  useEffect(() => {
    if (weapon.lock === lock) return
    updateWeaponMutation()
  }, [weapon.lock, lock, updateWeaponMutation])
  return (
    <IconButton
      color="primary"
      disabled={disabled || loading}
      onClick={() => setlock((l) => !l)}
      sx={{ position: 'absolute', right: 0, bottom: 0, zIndex: 2 }}
    >
      {lock ? <LockIcon /> : <LockOpenIcon />}
    </IconButton>
  )
}

import type { WeaponTypeKey } from '@genshin-optimizer/consts'
import { imgAssets, weaponAsset } from '@genshin-optimizer/gi-assets'
import type { IWeapon } from '@genshin-optimizer/gi-good'
import { WeaponName } from '@genshin-optimizer/gi-ui'
import { ascensionMaxLevel } from '@genshin-optimizer/gi-util'
import { CardThemed, StarsDisplay } from '@genshin-optimizer/ui-common'
import { Lock, LockOpen } from '@mui/icons-material'
import { Box, IconButton, Skeleton, Typography } from '@mui/material'
import Image from 'next/image'
import { Suspense } from 'react'
import { ImageIcon } from './ImageIcon'
import { assetWrapper } from './util'

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
  // TODO:
  // const { t } = useTranslation(['page_weapon', 'ui'])

  // const filter = useCallback(
  //   (cs: CharacterSheet) => cs.weaponTypeKey === weaponSheet?.weaponType,
  //   [weaponSheet]
  // )

  // const setLocation = useCallback(
  //   (k: LocationKey) =>
  //     weaponId && database.weapons.set(weaponId, { location: k }),
  //   [database, weaponId]
  // )

  // const UIData = useMemo(
  //   () =>
  //     weaponSheet &&
  //     weapon &&
  //     computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]),
  //   [weaponSheet, weapon]
  // )

  // const { level, ascension, refinement, location = '', lock } = weapon
  // const stats = [input.weapon.main, input.weapon.sub, input.weapon.sub2].map(
  //   (x) => UIData.get(x)
  // )

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
        {/* <CardContent>
          {stats.map((node) => {
            if (!node.info.name) return null
            return (
              <Box key={JSON.stringify(node.info)} sx={{ display: 'flex' }}>
                <Typography flexGrow={1}>
                  {node.info.icon} {node.info.name}
                </Typography>
                <Typography>{nodeVStr(node)}</Typography>
              </Box>
            )
          })}
        </CardContent> */}
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
            {/* {disabled ? (
              <LocationName location={location} />
            ) : (
              <LocationAutocomplete
                location={location}
                setLocation={setLocation}
                filter={filter}
                autoCompleteProps={{ getOptionDisabled: (t) => !t.key }}
              />
            )} */}
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
            )} */}
            {extraButtons}
          </Box>
        </Box>
      </CardThemed>
    </Suspense>
  )
}

function Header({ weapon, disabled = false }: WeaponCardProps) {
  const { key, level, ascension, refinement, location = '', lock } = weapon

  // TODO:
  // const weaponTypeKey = UIData.get(input.weapon.type).value!
  const weaponTypeKey: WeaponTypeKey = 'claymore'

  // TODO: weaponsheet rarity
  const rarity = 5
  return (
    <Box
      className={`grad-${rarity}star`}
      sx={{ position: 'relative', pt: 2, px: 2 }}
    >
      {!disabled && (
        <IconButton
          color="primary"
          onClick={() => {}} // TODO: lock onclick
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

import {
  BootstrapTooltip,
  CardThemed,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common/util'
import type { DiscRarityKey, LocationKey } from '@genshin-optimizer/zzz/consts'
import {
  getDiscMainStatVal,
  getDiscSubStatBaseVal,
} from '@genshin-optimizer/zzz/consts'
import type { IDisc, ISubstat } from '@genshin-optimizer/zzz/db'
import {
  DeleteForever,
  Edit,
  DoNotDisturb as Exclude,
  Lock,
  LockOpen,
} from '@mui/icons-material'
import {
  Box,
  Button,
  CardContent,
  Chip,
  IconButton,
  Skeleton,
  SvgIcon,
  Typography,
} from '@mui/material'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { LocationAutocomplete } from '../Character/LocationAutocomplete'
import { LocationName } from '../Character/LocationName'
import { DiscSetName } from './DiscTrans'
import { discLevelVariant } from './util'

export function DiscCard({
  disc,
  onClick,
  onEdit,
  onDelete,
  onLockToggle,
  setLocation,
  extraButtons,
  excluded = false,
}: {
  disc: IDisc
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onLockToggle?: () => void
  setLocation?: (lk: LocationKey) => void
  extraButtons?: JSX.Element
  excluded?: boolean
}) {
  const { t } = useTranslation('disc')
  const { t: tk } = useTranslation(['discs_gen', 'statKey_gen'])

  const {
    lock,
    slotKey,
    setKey,
    rarity,
    level,
    mainStatKey,
    substats,
    location,
  } = disc

  // const ele = allElementalDamageKeys.find((e) => mainStatKey.startsWith(e))
  // TODO: requires individual disc set piece names/desc added to sheets
  // const slotName = <DiscSetSlotName setKey={setKey} slotKey={slotKey} />
  // const slotDesc = <DiscSetSlotDesc setKey={setKey} slotKey={slotKey} />
  // const slotDescTooltip = slotDesc && (
  //   <InfoTooltip
  //     title={
  //       <Box>
  //         <Typography variant="h6">{slotName}</Typography>
  //         <Typography>{slotDesc}</Typography>
  //       </Box>
  //     }
  //   />
  // )

  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangular"
          sx={{ width: '100%', height: '100%', minHeight: 350 }}
        />
      }
    >
      <CardThemed
        bgt="light"
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Box
          // TODO: rarity color
          className={`grad-${rarity}star`}
          sx={{ position: 'relative', width: '100%' }}
        >
          {!onClick && !!onLockToggle && (
            <IconButton
              color="primary"
              onClick={onLockToggle}
              sx={{ position: 'absolute', right: 0, bottom: 0, zIndex: 2 }}
            >
              {lock ? <Lock /> : <LockOpen />}
            </IconButton>
          )}
          {excluded && (
            <SvgIcon
              color="primary"
              fontSize="large"
              sx={{ position: 'absolute', right: 3, bottom: 3, zIndex: 2 }}
            >
              <Exclude />
            </SvgIcon>
          )}
          <Box sx={{ pt: 2, px: 2, position: 'relative', zIndex: 1 }}>
            {/* header */}
            <Box
              component="div"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mb: 1 }}
            >
              <Chip
                size="small"
                label={<strong>{`+${level}`}</strong>}
                color={discLevelVariant(level)}
              />
              {/* TODO: if slotName used again, this needs to be added; otherwise
                  could just remove this since setKey check below already has fallback
                {!setKey && <Skeleton variant="text" width={100} />} */}
              <Typography
                noWrap
                sx={{
                  textAlign: 'center',
                  backgroundColor: 'rgba(100,100,100,0.35)',
                  borderRadius: '1em',
                  px: 1.5,
                }}
              >
                <strong>
                  {(setKey && <DiscSetName setKey={setKey} />) || 'Disc Set'}
                </strong>
              </Typography>
              {/* TODO: requires sheets
                {!slotDescTooltip ? <Skeleton width={10} /> : slotDescTooltip} */}
            </Box>
            <Typography
              color="text.secondary"
              variant="body2"
              sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}
            >
              {/* <SlotIcon iconProps={{ fontSize: 'inherit' }} slotKey={slotKey} /> */}
              Slot:{slotKey}
              {/* {tk(`discs_gen:${slotKey}`)} */}
            </Typography>
            <Typography
              variant="h6"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              {/* <StatIcon
                statKey={mainStatKey}
                iconProps={{ sx: { color: `${ele}.main` } }}
              /> */}
              <span>{tk(`statKey_gen:${mainStatKey}`)}</span>
            </Typography>
            <Typography variant="h5">
              <strong>
                {toPercent(
                  getDiscMainStatVal(rarity, mainStatKey, level),
                  mainStatKey
                ).toFixed(statKeyToFixed(mainStatKey))}
                {getUnitStr(mainStatKey)}
              </strong>
            </Typography>
            {/* <StarsDisplay stars={rarity} colored /> */}
            <SqBadge>{rarity}</SqBadge>
            {/* {process.env.NODE_ENV === "development" && <Typography color="common.black">{id || `""`} </Typography>} */}
          </Box>
          {/* <Box sx={{ height: '100%', position: 'absolute', right: 0, top: 0 }}>
            <Box
              component={NextImage ? NextImage : 'img'}
              alt="Disc Piece Image"
              src={discAsset(setKey, slotKey)}
              sx={{
                width: 'auto',
                height: '90%',
                float: 'right',
                marginBottom: '5%',
                marginTop: '5%',
                marginRight: '10%',
              }}
            />
          </Box> */}
        </Box>
        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            pt: 1,
            pb: '0!important',
            width: '100%',
          }}
        >
          {substats.map(
            (substat) =>
              substat.key && (
                <SubstatDisplay
                  key={substat.key}
                  substat={substat}
                  rarity={rarity}
                />
              )
          )}
          <Box flexGrow={1} />
          <Typography color="success.main">
            {/* TODO: depends on if we swap to using disc set names as card title
              {(setKey && <DiscSetName setKey={setKey} />) || 'Disc Set'}{' '} */}
            {/* TODO: requires sheets
              {setKey && (
                <InfoTooltipInline
                  title={<DiscSetTooltipContent setKey={setKey} />}
                />
              )} */}
          </Typography>
        </CardContent>
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
            {setLocation ? (
              <LocationAutocomplete locKey={location} setLocKey={setLocation} />
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
              <BootstrapTooltip
                title={<Typography>{t('edit')}</Typography>}
                placement="top"
                arrow
              >
                <Button color="info" size="small" onClick={onEdit}>
                  <Edit />
                </Button>
              </BootstrapTooltip>
            )}
            {!!onDelete && (
              <BootstrapTooltip
                title={lock ? t('cantDeleteLock') : ''}
                placement="top"
              >
                <span>
                  <Button
                    color="error"
                    size="small"
                    onClick={onDelete}
                    disabled={lock}
                    sx={{ top: '1px' }}
                  >
                    <DeleteForever />
                  </Button>
                </span>
              </BootstrapTooltip>
            )}
            {extraButtons}
          </Box>
        </Box>
      </CardThemed>
    </Suspense>
  )
}
function SubstatDisplay({
  substat,
  rarity,
}: {
  substat: ISubstat
  rarity: DiscRarityKey
}) {
  const { key, upgrades } = substat
  if (!upgrades || !key) return null
  const displayValue = toPercent(
    getDiscSubStatBaseVal(key, rarity) * upgrades,
    key
  ).toFixed(statKeyToFixed(key))
  return (
    <Typography sx={{ display: 'flex', alignItems: 'center' }}>
      {/* <StatDisplay statKey={key} /> */}
      {key}
      <span>
        +{displayValue}
        {getUnitStr(key)}
      </span>
    </Typography>
  )
}

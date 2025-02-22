import {
  BootstrapTooltip,
  CardThemed,
  ColorText,
  NextImage,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import { getUnitStr, toPercent } from '@genshin-optimizer/common/util'
import { relicAsset } from '@genshin-optimizer/sr/assets'
import {
  allElementalDamageKeys,
  type LocationKey,
} from '@genshin-optimizer/sr/consts'
import type { IRelic, ISubstat } from '@genshin-optimizer/sr/srod'
import { SlotIcon, StatIcon } from '@genshin-optimizer/sr/svgicons'
import {
  getRelicMainStatDisplayVal,
  statToFixed,
} from '@genshin-optimizer/sr/util'
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
import { LocationAutocomplete, StatDisplay } from '../Character'
import { LocationName } from '../Components'
import { RelicSetName } from './RelicTrans'
import { relicLevelVariant } from './util'

type RelicCardProps = {
  relic: IRelic
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onLockToggle?: () => void
  setLocation?: (lk: LocationKey) => void
  mainStatAssumptionLevel?: number
  extraButtons?: JSX.Element
  excluded?: boolean
}

export function RelicCard({
  relic,
  onClick,
  onEdit,
  onDelete,
  onLockToggle,
  setLocation,
  mainStatAssumptionLevel = 0,
  extraButtons,
  excluded = false,
}: RelicCardProps) {
  const { t } = useTranslation('relic')
  const { t: tk } = useTranslation(['relics_gen', 'statKey_gen'])

  const {
    lock,
    slotKey,
    setKey,
    rarity,
    level,
    mainStatKey,
    substats,
    location = '',
  } = relic

  const mainStatLevel = Math.max(
    Math.min(mainStatAssumptionLevel, rarity * 3),
    level
  )

  const ele = allElementalDamageKeys.find((e) => mainStatKey.startsWith(e))
  // TODO: requires individual relic set piece names/desc added to sheets
  // const slotName = <RelicSetSlotName setKey={setKey} slotKey={slotKey} />
  // const slotDesc = <RelicSetSlotDesc setKey={setKey} slotKey={slotKey} />
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
                color={relicLevelVariant(level)}
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
                  {(setKey && <RelicSetName setKey={setKey} />) || 'Relic Set'}
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
              <SlotIcon iconProps={{ fontSize: 'inherit' }} slotKey={slotKey} />
              {tk(`relics_gen:${slotKey}`)}
            </Typography>
            <Typography
              variant="h6"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <StatIcon
                statKey={mainStatKey}
                iconProps={{ sx: { color: `${ele}.main` } }}
              />
              <span>{tk(`statKey_gen:${mainStatKey}`)}</span>
            </Typography>
            <Typography variant="h5">
              <strong>
                <ColorText
                  color={mainStatLevel !== level ? 'warning' : undefined}
                >
                  {getRelicMainStatDisplayVal(rarity, mainStatKey, level)}
                  {getUnitStr(mainStatKey)}
                </ColorText>
              </strong>
            </Typography>
            <StarsDisplay stars={rarity} colored />
            {/* {process.env.NODE_ENV === "development" && <Typography color="common.black">{id || `""`} </Typography>} */}
          </Box>
          <Box sx={{ height: '100%', position: 'absolute', right: 0, top: 0 }}>
            <Box
              component={NextImage ? NextImage : 'img'}
              alt="Relic Piece Image"
              src={relicAsset(setKey, slotKey)}
              sx={{
                width: 'auto',
                height: '90%',
                float: 'right',
                marginBottom: '5%',
                marginTop: '5%',
                marginRight: '10%',
              }}
            />
          </Box>
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
                <SubstatDisplay key={substat.key} substat={substat} />
              )
          )}
          <Box flexGrow={1} />
          <Typography color="success.main">
            {/* TODO: depends on if we swap to using relic set names as card title
              {(setKey && <RelicSetName setKey={setKey} />) || 'Relic Set'}{' '} */}
            {/* TODO: requires sheets
              {setKey && (
                <InfoTooltipInline
                  title={<RelicSetTooltipContent setKey={setKey} />}
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
function SubstatDisplay({ substat }: { substat: ISubstat }) {
  const { key, value } = substat
  if (!value || !key) return null
  const displayValue = toPercent(value, key).toFixed(statToFixed(key))
  return (
    <Typography sx={{ display: 'flex', alignItems: 'center' }}>
      <StatDisplay statKey={key} />
      <span>
        +{displayValue}
        {getUnitStr(key)}
      </span>
    </Typography>
  )
}

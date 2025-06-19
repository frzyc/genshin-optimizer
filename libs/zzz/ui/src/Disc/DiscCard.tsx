import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  BootstrapTooltip,
  CardThemed,
  ColorText,
  ConditionalWrapper,
  NextImage,
} from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common/util'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscRarityKey, LocationKey } from '@genshin-optimizer/zzz/consts'
import {
  getDiscMainStatVal,
  getDiscSubStatBaseVal,
  rarityColor,
} from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext, useDisc } from '@genshin-optimizer/zzz/db-ui'
import type { IDisc, ISubstat } from '@genshin-optimizer/zzz/zood'
import { Edit } from '@mui/icons-material'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  ClickAwayListener,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import type { Theme } from '@mui/system'
import type { ReactNode } from 'react'
import { Suspense, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { StatDisplay } from '../Character'
import { LocationAutocomplete } from '../Character/LocationAutocomplete'
import { LocationName } from '../Character/LocationName'
import { ZCard } from '../Components'
import { DiscSet2p, DiscSet4p, DiscSetName } from './DiscTrans'
import { useSpinner } from './util'

export const DiscCard = memo(function DiscCard({
  discId,
  onEdit,
}: {
  key: string //remount when id changes
  discId: string
  onEdit?: (id: string) => void
}) {
  const { database } = useDatabaseContext()
  const disc = useDisc(discId)
  const onEditCB = useCallback(() => onEdit && onEdit(discId), [discId, onEdit])
  const onDelete = useCallback(() => {
    database.discs.remove(discId)
  }, [database.discs, discId])
  const setLocation = useCallback(
    (location: LocationKey) => database.discs.set(discId, { location }),
    [database.discs, discId]
  )
  const onLockToggle = useCallback(
    () => database.discs.set(discId, ({ lock }) => ({ lock: !lock })),
    [database.discs, discId]
  )
  if (!disc) return null
  return (
    <DiscCardObj
      disc={disc}
      onEdit={onEditCB}
      onDelete={onDelete}
      setLocation={setLocation}
      onLockToggle={onLockToggle}
    />
  )
})
export function DiscCardObj({
  disc,
  onClick,
  onEdit,
  setLocation,
  extraButtons,
}: {
  disc: IDisc
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onLockToggle?: () => void
  setLocation?: (lk: LocationKey) => void
  extraButtons?: JSX.Element
}) {
  const { t } = useTranslation('disc')
  const {
    rotation,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging,
  } = useSpinner()
  const { slotKey, setKey, rarity, level, mainStatKey, substats, location } =
    disc
  const [show, onShow, onHide] = useBoolState()

  const wrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea onClick={onClick}>{children}</CardActionArea>
    ),
    [onClick]
  )
  const falseWrapperFunc = useCallback(
    (children: ReactNode) => (
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    ),
    []
  )

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
      <ZCard
        bgt="dark"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        <ConditionalWrapper
          condition={!!onClick}
          wrapper={wrapperFunc}
          falseWrapper={falseWrapperFunc}
        >
          <CardContent>
            <CardThemed bgt="light" sx={{ borderRadius: '11px' }}>
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <ClickAwayListener onClickAway={onHide}>
                  <div>
                    <BootstrapTooltip
                      placement="top"
                      onClose={onHide}
                      open={show}
                      disableFocusListener
                      disableTouchListener
                      title={
                        <Box>
                          <Typography>
                            2-Piece Set: <DiscSet2p setKey={setKey} />
                          </Typography>
                          <Typography>
                            4-Piece Set: <DiscSet4p setKey={setKey} />
                          </Typography>
                        </Box>
                      }
                      slotProps={{
                        popper: {
                          disablePortal: true,
                        },
                      }}
                    >
                      <Typography
                        noWrap
                        variant="subtitle1"
                        align="center"
                        fontWeight="bold"
                        maxWidth={'100%'}
                        onClick={onShow}
                      >
                        [{slotKey}] <DiscSetName setKey={setKey} />
                      </Typography>
                    </BootstrapTooltip>
                  </div>
                </ClickAwayListener>
                <Box
                  sx={(theme: Theme) => ({
                    border: `4px solid ${
                      theme.palette[rarityColor[rarity]].main
                    }`,
                    borderRadius: '50%',
                  })}
                >
                  <Box
                    component="div"
                    onMouseDown={handleMouseDown as any}
                    onMouseMove={handleMouseMove as any}
                    onMouseUp={handleMouseUp as any}
                    onMouseLeave={handleMouseUp as any}
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      borderRadius: '50%',
                      border: `2px solid black`,
                    }}
                  >
                    <Box
                      component={NextImage ? NextImage : 'img'}
                      alt="Disc Piece Image"
                      src={discDefIcon(setKey)}
                      style={{
                        transform: `rotate(${rotation}deg)`,
                      }}
                      sx={{
                        width: 'auto',
                        float: 'right',
                        height: '150px',
                        transition: isDragging
                          ? 'none'
                          : 'transform 0.1s ease-out',
                      }}
                    />
                    <Box sx={{ height: 0, position: 'absolute', bottom: 30 }}>
                      <Typography
                        sx={{
                          backgroundColor: 'rgba(0,0,0,0.85)',
                          py: '3px',
                          px: '30px',
                          borderRadius: '20px',
                          fontWeight: 'bold',
                        }}
                        variant="h6"
                      >
                        {level}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {/* Main stats */}
              </CardContent>
            </CardThemed>
            <Stack spacing={1} sx={{ pt: 1 }}>
              <Box
                display="flex"
                gap={1}
                alignItems="center"
                width={'100%'}
                color={`${rarityColor[rarity]}.main`}
              >
                <Typography
                  variant="subtitle1"
                  noWrap
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexGrow: 1,
                    fontWeight: 'bold',
                  }}
                >
                  <StatDisplay statKey={mainStatKey} />
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {toPercent(
                    getDiscMainStatVal(rarity, mainStatKey, level),
                    mainStatKey
                  ).toFixed(statKeyToFixed(mainStatKey))}
                  {getUnitStr(mainStatKey)}
                </Typography>
              </Box>
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
            </Stack>
          </CardContent>
        </ConditionalWrapper>

        <Box flexGrow={1} />
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
            {/* {!!onDelete && (
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
            )} */}
            {extraButtons}
          </Box>
        </Box>
      </ZCard>
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
    <Typography
      variant="subtitle2"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontWeight: 'bold',
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StatDisplay statKey={key} />
        {upgrades > 1 && <ColorText color="warning">+{upgrades - 1}</ColorText>}
      </Box>
      <span>
        {displayValue}
        {getUnitStr(key)}
      </span>
    </Typography>
  )
}

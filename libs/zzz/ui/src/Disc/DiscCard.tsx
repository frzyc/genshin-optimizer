import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  BootstrapTooltip,
  CardThemed,
  ColorText,
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
import type { IDisc, ISubstat } from '@genshin-optimizer/zzz/zood'
import { Edit } from '@mui/icons-material'
import {
  Box,
  Button,
  CardContent,
  ClickAwayListener,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import type { Theme } from '@mui/system'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StatDisplay } from '../Character'
import { LocationAutocomplete } from '../Character/LocationAutocomplete'
import { LocationName } from '../Character/LocationName'
import { ZCard } from '../Components'
import { DiscSet2p, DiscSet4p, DiscSetName } from './DiscTrans'

export function DiscCard({
  disc,
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

function useSpinner() {
  // spinner image state data
  const [rotation, setRotation] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const dragging = useRef(false)
  const lastAngle = useRef(0)
  const lastTime = useRef(Date.now())
  const center = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault()

    const rect = (e as any).target.getBoundingClientRect() as DOMRect
    center.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
    dragging.current = true
    lastAngle.current = Math.atan2(
      e.clientY - center.current.y,
      e.clientX - center.current.x
    )
    lastTime.current = Date.now()
    setVelocity(0)
  }

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    if (!dragging.current) return
    const now = Date.now()
    const deltaTime = now - lastTime.current

    const angle = Math.atan2(
      e.clientY - center.current.y,
      e.clientX - center.current.x
    )
    const deltaAngle = (angle - lastAngle.current) * (180 / Math.PI)

    setRotation((prev) => prev + deltaAngle)
    setVelocity((deltaAngle / deltaTime) * 20)
    lastAngle.current = angle
    lastTime.current = now
  }

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault()
    dragging.current = false
  }

  useEffect(() => {
    if (!dragging.current) {
      const momentum = setInterval(() => {
        setRotation((prev) => {
          if (Math.abs(velocity) < 0.1) {
            clearInterval(momentum)
            return prev
          }
          setVelocity((v) => v * 0.98)
          return prev + velocity
        })
      }, 16)
      return () => clearInterval(momentum)
    }
    return () => {}
  }, [velocity])

  return {
    rotation,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging: dragging.current,
  }
}

import {
  BootstrapTooltip,
  CardThemed,
  ColorText,
  NextImage,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common/util'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscRarityKey, LocationKey } from '@genshin-optimizer/zzz/consts'
import {
  discMaxLevel,
  discRarityColor,
  getDiscMainStatVal,
  getDiscSubStatBaseVal,
} from '@genshin-optimizer/zzz/consts'
import type { IDisc, ISubstat } from '@genshin-optimizer/zzz/db'
import { DeleteForever, Edit } from '@mui/icons-material'
import {
  Box,
  Button,
  CardContent,
  Chip,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StatDisplay } from '../Character'
import { LocationAutocomplete } from '../Character/LocationAutocomplete'
import { LocationName } from '../Character/LocationName'
import { DiscSetName } from './DiscTrans'

export function DiscCard({
  disc,
  onEdit,
  onDelete,
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
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 150,
            mt: 2,
            px: 2,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              pointerEvents: 'none',
              height: '100%',
            }}
          >
            {/* header */}
            <Box
              component="div"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1,
                justifyContent: 'space-between',
              }}
            >
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
                  backdropFilter: 'blur(3px)',
                }}
              >
                <strong>
                  {(setKey && <DiscSetName setKey={setKey} />) || 'Disc Set'}
                </strong>
              </Typography>{' '}
              <SqBadge color="secondary">{slotKey}</SqBadge>
              {/* TODO: requires sheets
                {!slotDescTooltip ? <Skeleton width={10} /> : slotDescTooltip} */}
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                alignItems: 'start',
                position: 'absolute',
                bottom: 0,
              }}
            >
              <SqBadge color={discRarityColor[rarity]}>{rarity}</SqBadge>
              <Chip
                sx={{ backdropFilter: 'blur(3px)' }}
                size="small"
                label={
                  <strong>
                    {`Lv. ${level}`}/{discMaxLevel[rarity]}
                  </strong>
                }
                // color={discLevelVariant(level)}
              />
              <Box sx={{ flexGrow: 1 }}></Box>
              {/* {!onClick && !!onLockToggle && (
                <IconButton size="small" color="primary" onClick={onLockToggle}>
                  {lock ? <Lock /> : <LockOpen />}
                </IconButton>
              )} */}
            </Box>

            {/* {process.env.NODE_ENV === "development" && <Typography color="common.black">{id || `""`} </Typography>} */}
          </Box>
          <Box
            sx={{
              height: '100%',
              position: 'absolute',
              right: 0,
              top: 0,
              pr: 2,
            }}
          >
            <Box
              component={NextImage ? NextImage : 'img'}
              alt="Disc Piece Image"
              src={discDefIcon(setKey)}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              sx={{
                width: 'auto',
                height: '90%',
                float: 'right',
                minHeight: '150px',
                transform: `rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
            />
          </Box>
        </Box>
        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            py: '0!important',
            width: '100%',
          }}
        >
          <Box display="flex" gap={1} alignItems="center">
            <Typography
              variant="h6"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexGrow: 1,
              }}
            >
              {/* <StatIcon
                statKey={mainStatKey}
                iconProps={{ sx: { color: `${ele}.main` } }}
              /> */}
              <StatDisplay statKey={mainStatKey} />
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
          </Box>
          {substats.map(
            (substat) =>
              substat.key && (
                <React.Fragment key={substat.key}>
                  <Divider />
                  <SubstatDisplay substat={substat} rarity={rarity} />
                </React.Fragment>
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
    <Typography
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span>
        <StatDisplay statKey={key} />{' '}
        {upgrades > 1 && <ColorText color="warning">+{upgrades - 1}</ColorText>}
      </span>
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

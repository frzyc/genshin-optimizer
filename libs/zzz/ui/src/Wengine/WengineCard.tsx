import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  BootstrapTooltip,
  CardThemed,
  ImgIcon,
  NextImage,
} from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common/util'
import type { WenginePhaseKey } from '@genshin-optimizer/zzz/assets'
import {
  specialityDefIcon,
  wengineAsset,
  wenginePhaseIcon,
} from '@genshin-optimizer/zzz/assets'
import type {
  LocationKey,
  PhaseKey,
  WengineSubStatKey,
} from '@genshin-optimizer/zzz/consts'
import { rarityColor } from '@genshin-optimizer/zzz/consts'
import { useWengine } from '@genshin-optimizer/zzz/db-ui'
import { getWengineStat, getWengineStats } from '@genshin-optimizer/zzz/stats'
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
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { StatDisplay } from '../Character'
import { LocationAutocomplete } from '../Character/LocationAutocomplete'
import { LocationName } from '../Character/LocationName'
import { ZCard } from '../Components'

const wenginePhases: Record<PhaseKey, WenginePhaseKey> = {
  1: 'p1',
  2: 'p2',
  3: 'p3',
  4: 'p4',
  5: 'p5',
}

export function WengineCard({
  wengineId,
  onEdit,
  setLocation,
}: {
  wengineId: string
  onClick?: () => void
  onEdit?: (wengineId: string) => void
  setLocation?: (lk: LocationKey) => void
}) {
  const { t } = useTranslation('wengineNames')
  const [show, onShow, onHide] = useBoolState()
  const {
    id = '',
    key,
    level = 0,
    phase = 1,
    location = '',
  } = useWengine(wengineId) ?? {}
  if (!key) return
  const wengineStat = getWengineStat(key)
  const wengineStats = getWengineStats(key, level, phase)
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
                paddingBottom: '0 !important',
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
                        <Typography>Description</Typography>
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
                      width="200px"
                      onClick={onShow}
                    >
                      {
                        <ImgIcon
                          size={2}
                          src={specialityDefIcon(wengineStat.type)}
                        />
                      }{' '}
                      {t(`${key}`)}
                    </Typography>
                  </BootstrapTooltip>
                </div>
              </ClickAwayListener>
              <Box component="div">
                <Box
                  component={NextImage ? NextImage : 'img'}
                  alt="Wengine Image"
                  src={wengineAsset(key, 'icon')}
                  sx={{
                    width: 'auto',
                    float: 'right',
                    height: '150px',
                  }}
                />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                width="100%"
                alignItems="center"
              >
                <Typography
                  sx={{
                    fontWeight: 'bold',
                  }}
                  variant="h6"
                >
                  Lv.{level}
                </Typography>
                <Box>
                  <ImgIcon
                    size={3}
                    src={wenginePhaseIcon(wenginePhases[phase])}
                    sx={{ py: '10px', margin: 0, width: '5em' }}
                  />{' '}
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
              color={`${rarityColor[wengineStat.rarity]}.main`}
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
                <StatDisplay statKey={'atk'} />
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {wengineStats['atk_base'].toFixed()}
              </Typography>
            </Box>
            <SubstatDisplay
              substatKey={wengineStat['second_statkey']}
              substatValue={wengineStats[wengineStat['second_statkey']]}
            />
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
                <Button color="info" size="small" onClick={() => onEdit(id)}>
                  <Edit />
                </Button>
              </BootstrapTooltip>
            )}
          </Box>
        </Box>
      </ZCard>
    </Suspense>
  )
}
function SubstatDisplay({
  substatKey,
  substatValue,
}: {
  substatKey: WengineSubStatKey
  substatValue: number
}) {
  if (!substatKey) return null
  const displayValue = toPercent(substatValue, substatKey).toFixed(
    statKeyToFixed(substatKey)
  )
  return (
    <Typography
      variant="subtitle2"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontWeight: 'bold',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StatDisplay statKey={substatKey} />
      </Box>
      <span>
        {displayValue}
        {getUnitStr(substatKey)}
      </span>
    </Typography>
  )
}

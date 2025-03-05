import {
  BootstrapTooltip,
  CardThemed,
  ImgIcon,
  NextImage,
} from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import {
  specialityDefIcon,
  wengineAsset,
  wenginePhaseIcon,
} from '@genshin-optimizer/zzz/assets'
import type {
  LocationKey,
  MilestoneKey,
  PhaseKey,
  SpecialityKey,
  WengineKey,
  WengineSubStatKey,
} from '@genshin-optimizer/zzz/consts'
import { rarityColor } from '@genshin-optimizer/zzz/consts'
import { useWengine } from '@genshin-optimizer/zzz/db-ui'
import { getWengineStat, getWengineStats } from '@genshin-optimizer/zzz/stats'
import { Edit } from '@mui/icons-material'
import { Box, Button, CardContent, Skeleton, Typography } from '@mui/material'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { LocationAutocomplete, StatDisplay } from '../Character'
import { LocationName } from '../Character/LocationName'
import { ZCard } from '../Components'
import { WengineSubstatDisplay } from './WengineSubstatDisplay'
import { WengineName } from './WengineTrans'

export function EquippedWengine({
  wengineId,
  onEdit,
  setLocation,
  extraButtons,
}: {
  wengineId: string
  onEdit?: (wengineId: string) => void
  setLocation?: (lk: LocationKey) => void
  extraButtons?: JSX.Element
}) {
  const {
    id = '',
    key,
    level = 0,
    phase = 1,
    location = '',
    modification = 0,
  } = useWengine(wengineId) ?? {}
  if (!key)
    return (
      <CardThemed>
        <Typography color="error">Error: Wengine not found</Typography>
      </CardThemed>
    )
  const wengineStat = getWengineStat(key)
  const wengineHeaderInfo = {
    level,
    phase,
    key,
    type: wengineStat.type,
  }
  const wengineContentInfo = {
    level,
    phase,
    key,
    modification,
    secondStatKey: wengineStat['second_statkey'],
  }
  const wengineFooterInfo = {
    location,
    id,
  }

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
          flexGrow: 1,
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
          }}
        >
          <CardThemed
            sx={(theme) => ({
              border: `4px solid ${
                theme.palette[rarityColor[wengineStat.rarity]].main
              }`,
              width: '193px',
              height: '193px',
            })}
          >
            <Box
              component={NextImage ? NextImage : 'img'}
              alt="Wengine Image"
              src={wengineAsset(key, 'icon')}
              sx={{
                width: '100%',
                height: '100%',
              }}
            />
          </CardThemed>
          <Box
            sx={{
              flexGrow: 1,
              ml: '24px',
            }}
          >
            <EquippedWengineHeader wengineHeaderInfo={wengineHeaderInfo} />
            <EquippedWengineContent wengineContentInfo={wengineContentInfo} />
            <EquippedWengineFooter
              wengineFooterInfo={wengineFooterInfo}
              onEdit={onEdit}
              setLocation={setLocation}
              extraButtons={extraButtons}
            />
          </Box>
        </CardContent>
      </ZCard>
    </Suspense>
  )
}

export function EquippedWengineHeader({
  wengineHeaderInfo,
}: {
  wengineHeaderInfo: {
    level: number
    phase: PhaseKey
    key: WengineKey
    type: SpecialityKey
  }
}) {
  const { level, phase, key, type } = wengineHeaderInfo
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: '16px',
      }}
    >
      <Typography
        noWrap
        variant="h6"
        sx={{
          fontWeight: '900',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <ImgIcon size={1.5} src={specialityDefIcon(type)} sx={{ mr: '4px' }} />
        <WengineName wKey={key} />
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#2B364D',
          borderRadius: '12px',
          px: '16px',
        }}
      >
        <Typography
          sx={{
            fontWeight: '900',
            fontStyle: 'italic',
          }}
          variant="subtitle1"
        >
          Lv.{level}
        </Typography>
        <Box sx={{ display: 'flex', width: '7em' }}>
          {range(1, 5).map((index: number) => {
            return index <= phase ? (
              <ImgIcon
                src={wenginePhaseIcon('singlePhase')}
                sx={{ margin: 0, width: '5em', height: '1.5em' }}
              />
            ) : (
              <ImgIcon
                src={wenginePhaseIcon('singleNonPhase')}
                sx={{ margin: 0, width: '5em', height: '1.5em' }}
              />
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}

export function EquippedWengineContent({
  wengineContentInfo,
}: {
  wengineContentInfo: {
    level: number
    phase: PhaseKey
    key: WengineKey
    modification: MilestoneKey
    secondStatKey: WengineSubStatKey
  }
}) {
  const { level, phase, key, modification, secondStatKey } = wengineContentInfo
  const wengineStats = getWengineStats(key, level, phase, modification)
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          px: '16px',
          py: '8px',
          mb: '12px',
          background: '#2B364D',
          borderRadius: '20px',
        }}
      >
        <Typography
          variant="subtitle1"
          noWrap
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            fontWeight: '900',
          }}
        >
          <StatDisplay statKey={'atk'} />
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: '900' }}>
          {wengineStats['atk_base'].toFixed()}
        </Typography>
      </Box>
      <ZCard
        bgt="dark"
        sx={{ display: 'flex', px: '16px', py: '6px', mb: '8px' }}
      >
        <WengineSubstatDisplay
          substatKey={secondStatKey}
          substatValue={wengineStats[secondStatKey]}
        />
      </ZCard>
    </Box>
  )
}

export function EquippedWengineFooter({
  wengineFooterInfo,
  onEdit,
  setLocation,
  extraButtons,
}: {
  wengineFooterInfo: {
    location: LocationKey
    id: string
  }
  onEdit?: (wengineId: string) => void
  setLocation?: (lk: LocationKey) => void
  extraButtons?: JSX.Element
}) {
  const { t } = useTranslation('ui')
  const { location, id } = wengineFooterInfo
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <Box
        gap={1}
        sx={{
          '& .MuiButton-root': { minWidth: 0, height: '100%' },
          display: 'flex',
          alignItems: 'center',
          mt: '8px',
        }}
      >
        <Box sx={{ marginRight: '12px' }}>
          {setLocation ? (
            <LocationAutocomplete locKey={location} setLocKey={setLocation} />
          ) : (
            <LocationName location={location} />
          )}
        </Box>
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
        {extraButtons}
      </Box>
    </Box>
  )
}

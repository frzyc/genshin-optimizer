import { CardThemed, CustomNumberInput } from '@genshin-optimizer/common/ui'
import { clamp } from '@genshin-optimizer/common/util'
import { PandoOptConfigContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { Box, CardContent, Divider, Slider, Typography } from '@mui/material'
import { memo, useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const WEAPON_MAX = 90

export const WeaponLevelFilter = memo(function WeaponLevelFilter({
  disabled = false,
}: {
  disabled?: boolean
}) {
  const { t } = useTranslation('page_optimize')
  const database = useDatabase()
  const { optConfigId, optConfig } = useContext(PandoOptConfigContext)
  const levelLow = optConfig.wlevelLow
  const levelHigh = optConfig.wlevelHigh
  const [sliderLow, setSliderLow] = useState(levelLow)
  const [sliderHigh, setSliderHigh] = useState(levelHigh)
  const setSlider = useCallback((_e: unknown, value: number | number[]) => {
    if (typeof value === 'number') throw new TypeError()
    const [l, h] = value
    setSliderLow(l)
    setSliderHigh(h)
  }, [])
  useEffect(() => setSliderLow(levelLow), [levelLow])
  useEffect(() => setSliderHigh(levelHigh), [levelHigh])
  return (
    <CardThemed bgt="light">
      <CardContent sx={{ display: 'flex', gap: 1 }}>
        <Typography sx={{ fontWeight: 'bold' }}>
          {t('weaponLevelFilter')}
        </Typography>
      </CardContent>
      <Divider />
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'contentLight.main',
        }}
      >
        <CustomNumberInput
          value={sliderLow}
          onChange={(val) =>
            database.pandoOptConfigs.set(optConfigId, {
              wlevelLow: clamp(val ?? 0, 0, levelHigh),
            })
          }
          sx={{ px: 1, width: '3em' }}
          inputProps={{ sx: { textAlign: 'center' } }}
          disabled={disabled}
        />
        <Slider
          sx={{ flex: '0 1 100%', mx: 2 }}
          getAriaLabel={() => 'Weapon Level Range'}
          value={[sliderLow, sliderHigh]}
          onChange={setSlider}
          onChangeCommitted={(_e, value) =>
            Array.isArray(value) &&
            database.pandoOptConfigs.set(optConfigId, {
              wlevelLow: value[0],
              wlevelHigh: value[1],
            })
          }
          valueLabelDisplay="auto"
          min={0}
          max={WEAPON_MAX}
          step={1}
          marks
          disabled={disabled}
        />
        <CustomNumberInput
          value={sliderHigh}
          onChange={(val) =>
            database.pandoOptConfigs.set(optConfigId, {
              wlevelHigh: clamp(val ?? 0, levelLow, WEAPON_MAX),
            })
          }
          sx={{ px: 1, flex: '0 0 3em' }}
          inputProps={{ sx: { textAlign: 'center' } }}
          disabled={disabled}
        />
      </Box>
    </CardThemed>
  )
})

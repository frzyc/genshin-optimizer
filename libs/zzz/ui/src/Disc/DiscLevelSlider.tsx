'use client'
import { CustomNumberInput } from '@genshin-optimizer/common/ui'
import { clamp } from '@genshin-optimizer/common/util'
import { Box, Divider, Slider } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function DiscLevelSlider({
  levelLow,
  levelHigh,
  setLow,
  setHigh,
  setBoth,
  dark = false,
  disabled = false,
  showLevelText = false,
}: {
  levelLow: number
  levelHigh: number
  setLow: (low: number) => void
  setHigh: (high: number) => void
  setBoth: (low: number, high: number) => void
  dark?: boolean
  disabled?: boolean
  showLevelText?: boolean
}) {
  const { t } = useTranslation('artifact')
  const [sliderLow, setsliderLow] = useState(levelLow)
  const [sliderHigh, setsliderHigh] = useState(levelHigh)
  const setSlider = useCallback(
    (e: unknown, value: number | number[]) => {
      if (typeof value == 'number') throw new TypeError()
      const [l, h] = value
      setsliderLow(l)
      setsliderHigh(h)
    },
    [setsliderLow, setsliderHigh]
  )
  useEffect(() => setsliderLow(levelLow), [setsliderLow, levelLow])

  useEffect(() => setsliderHigh(levelHigh), [setsliderHigh, levelHigh])
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        bgcolor: dark ? 'contentNormal.main' : 'contentLight.main',
        overflow: 'visible',
      }}
    >
      <Box sx={{ width: 'max-content', height: 32, display: 'flex' }}>
        {showLevelText ? (
          <>
            <span
              style={{
                padding: '0 1em',
                width: 'max-content',
                borderRadius: '4px 0 0 4px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'rgba(255,255,255,0.9)',
                backgroundColor: 'rgb(30,120,200)',
              }}
            >
              {t('levelSliderTitle')}
            </span>
            <Divider orientation="vertical" flexItem />
          </>
        ) : undefined}

        <CustomNumberInput
          value={sliderLow}
          onChange={(val) => setLow(clamp(val ?? 0, 0, levelHigh))}
          sx={{
            px: 1,
            width: '3em',
          }}
          inputProps={{ sx: { textAlign: showLevelText ? 'right' : 'center' } }}
          disabled={disabled}
        />
      </Box>
      <Slider
        sx={{ flex: '0 1 100%', mx: 2 }}
        getAriaLabel={() => 'Arifact Level Range'}
        value={[sliderLow, sliderHigh]}
        onChange={setSlider}
        onChangeCommitted={(e, value) =>
          Array.isArray(value) && setBoth(value[0], value[1])
        }
        valueLabelDisplay="auto"
        min={0}
        max={15}
        step={1}
        marks
        disabled={disabled}
      />
      <CustomNumberInput
        value={sliderHigh}
        onChange={(val) => setHigh(clamp(val ?? 0, levelLow, 20))}
        sx={{ px: 1, flex: '0 0 3em' }}
        inputProps={{ sx: { textAlign: 'center' } }}
        disabled={disabled}
      />
    </Box>
  )
}

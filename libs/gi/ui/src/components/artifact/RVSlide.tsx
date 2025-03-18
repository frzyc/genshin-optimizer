'use client'
import { CustomNumberInput } from '@genshin-optimizer/common/ui'
import { clamp } from '@genshin-optimizer/common/util'
import { Box, Button, Card, Divider, Slider } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function RVSlide({
  rvLow,
  rvHigh,
  useMaxRV,
  switchFilter,
  setLow,
  setHigh,
  setBoth,
  dark = false,
  disabled = false,
}: {
  rvLow: number
  rvHigh: number
  useMaxRV: boolean
  switchFilter: (useMax: boolean) => void
  setLow: (low: number) => void
  setHigh: (high: number) => void
  setBoth: (low: number, high: number) => void
  dark?: boolean
  disabled?: boolean
  showLevelText?: boolean
}) {
  const { t } = useTranslation('artifact')
  const [MRV_RV, setMRV_RV] = useState(useMaxRV) // Switch between MaxRV/RV
  const [sliderLow, setsliderLow] = useState(rvLow)
  const [sliderHigh, setsliderHigh] = useState(rvHigh)
  const setSlider = useCallback((_e: unknown, value: number | number[]) => {
    if (typeof value === 'number') throw new TypeError()
    const [l, h] = value
    setsliderLow(l)
    setsliderHigh(h)
  }, [])
  useEffect(() => setsliderLow(rvLow), [rvLow])

  useEffect(() => setsliderHigh(rvHigh), [rvHigh])

  useEffect(() => setMRV_RV(useMaxRV), [useMaxRV])
  return (
    <Card
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        bgcolor: dark ? 'contentNormal.main' : 'contentLight.main',
        overflow: 'visible',
      }}
    >
      <Box sx={{ width: 'max-content', height: 32, display: 'flex' }}>
        <Button
          onClick={() => switchFilter(!useMaxRV)}
          sx={{
            p: '0 1em',
            width: 'max-content',
            borderRadius: '4px 0 0 4px',
            fontWeight: 400,
            fontSize: '16px',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          {MRV_RV ? t('rvSliderBtn.maximum') : t('rvSliderBtn.current')}
        </Button>

        <Divider orientation="vertical" flexItem />

        <CustomNumberInput
          value={sliderLow}
          onChange={(val) => setLow(clamp(val ?? 0, 0, sliderHigh))}
          sx={{
            pr: 1,
            width: 50,
          }}
          inputProps={{ sx: { textAlign: 'right' } }}
          disabled={disabled}
        />
      </Box>

      <Slider
        sx={{ flex: '0 1 100%', mx: 2 }}
        getAriaLabel={() => `Arifact ${MRV_RV ? 'Max RV' : 'RV'} Range`}
        value={[sliderLow, sliderHigh]}
        onChange={setSlider}
        onChangeCommitted={(_e, value) =>
          Array.isArray(value) && setBoth(value[0], value[1])
        }
        valueLabelDisplay="auto"
        min={0}
        max={900}
        disabled={disabled}
      />
      <CustomNumberInput
        value={sliderHigh}
        onChange={(val) => setHigh(clamp(val ?? 0, sliderLow, 900))}
        sx={{ px: 1, flex: '0 0 50px', borderRadius: '0 4px 4px 0' }}
        inputProps={{ sx: { textAlign: 'center' } }}
        disabled={disabled}
      />
    </Card>
  )
}

import { clamp } from '@genshin-optimizer/common/util'
import { Card, Slider, Button, Box } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import CustomNumberInput from '../CustomNumberInput'

export default function RVSlide({
  rvLow,
  rvHigh,
  mrvLow,
  mrvHigh,
  reset,
  setLow,
  setHigh,
  setBoth,
  dark = false,
  disabled = false,
}: {
  rvLow: number
  rvHigh: number
  mrvLow: number
  mrvHigh: number
  reset: () => void
  setLow: (low: number, useMax: boolean) => void
  setHigh: (high: number, useMax: boolean) => void
  setBoth: (low: number, high: number, useMax: boolean) => void
  dark?: boolean
  disabled?: boolean
  showLevelText?: boolean
}) {
  const [useMaxRV, setuseMaxRV] = useState(false)
  const [sliderLow, setsliderLow] = useState(useMaxRV ? mrvLow : rvLow)
  const [sliderHigh, setsliderHigh] = useState(useMaxRV ? mrvHigh : rvHigh)
  const setSlider = useCallback(
    (e: unknown, value: number | number[]) => {
      if (typeof value == 'number') throw new TypeError()
      const [l, h] = value
      setsliderLow(l)
      setsliderHigh(h)
    },
    [setsliderLow, setsliderHigh]
  )
  useEffect(
    () => setsliderLow(useMaxRV ? mrvLow : rvLow),
    [setsliderLow, rvLow, mrvLow, useMaxRV]
  )

  useEffect(
    () => setsliderHigh(useMaxRV ? mrvHigh : rvHigh),
    [setsliderHigh, rvHigh, mrvHigh, useMaxRV]
  )
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
      <Box
        sx={{ width: 100, height: 30, display: 'flex', alignItems: 'center' }}
      >
        <Button
          onClick={() =>
            setuseMaxRV((useMaxRV) => {
              reset()
              return !useMaxRV
            })
          }
          sx={{
            p: 0,
            minWidth: 0,
            width: '50%',
            height: '100%',
            borderRadius: '4px 0 0 4px',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translate(-3px, -3px)' },
          }}
        >
          {useMaxRV ? 'MRV' : 'RV'}
        </Button>

        <CustomNumberInput
          value={sliderLow}
          onChange={(val) => setLow(clamp(val ?? 0, 0, sliderHigh), useMaxRV)}
          sx={{
            pr: 1,
            pl: 2,
            width: '50%',
            height: '100%',
            borderRadius: '0 0 0 0',
          }}
          inputProps={{ sx: { textAlign: 'right' } }}
          disabled={disabled}
        />
      </Box>

      <Slider
        sx={{ width: 100, flexGrow: 1, mx: 2 }}
        getAriaLabel={() => `Arifact ${useMaxRV ? 'Max RV' : 'RV'} Range`}
        value={[sliderLow, sliderHigh]}
        onChange={setSlider}
        onChangeCommitted={(e, value) => setBoth(value[0], value[1], useMaxRV)}
        valueLabelDisplay="auto"
        min={0}
        max={900}
        disabled={disabled}
      />
      <CustomNumberInput
        value={sliderHigh}
        onChange={(val) => setHigh(clamp(val ?? 0, sliderLow, 900), useMaxRV)}
        sx={{ px: 1, width: 50, borderRadius: '0 4px 4px 0' }}
        inputProps={{ sx: { textAlign: 'center' } }}
        disabled={disabled}
      />
    </Card>
  )
}

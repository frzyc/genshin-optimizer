import { Card, Slider } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { clamp } from "../../Util/Util"
import CustomNumberInput from "../CustomNumberInput"

export default function ArtifactLevelSlider({ levelLow, levelHigh, setLow, setHigh, setBoth, dark = false, disabled = false, showLevelText = false }: {
  levelLow: number,
  levelHigh: number,
  setLow: (low: number) => void,
  setHigh: (high: number) => void,
  setBoth: (low: number, high: number) => void,
  dark?: boolean,
  disabled?: boolean,
  showLevelText?: boolean,
}) {
  const [sliderLow, setsliderLow] = useState(levelLow)
  const [sliderHigh, setsliderHigh] = useState(levelHigh)
  const setSlider = useCallback(
    (e: unknown, value: number | number[]) => {
      if (typeof value == "number") throw new TypeError()
      const [l, h] = value
      setsliderLow(l)
      setsliderHigh(h)
    },
    [setsliderLow, setsliderHigh])
  useEffect(() => setsliderLow(levelLow), [setsliderLow, levelLow])

  useEffect(() => setsliderHigh(levelHigh), [setsliderHigh, levelHigh])
  return <Card sx={{ width: "100%", display: "flex", alignItems: "center", bgcolor: dark ? "contentDark.main" : "contentLight.main" }}>
    <CustomNumberInput
      value={sliderLow}
      onChange={val => setLow(clamp(val, 0, levelHigh))}
      sx={{ px: 1, pl: showLevelText ? 2 : undefined, width: showLevelText ? 100 : 50, }}
      inputProps={{ sx: { textAlign: showLevelText ? "right" : "center" } }}
      startAdornment={showLevelText ? "Level: " : undefined}
      disabled={disabled}
    />
    <Slider sx={{ width: 100, flexGrow: 1, mx: 2 }}
      getAriaLabel={() => 'Arifact Level Range'}
      value={[sliderLow, sliderHigh]}
      onChange={setSlider}
      onChangeCommitted={(e, value) => setBoth(value[0], value[1])}
      valueLabelDisplay="auto"
      min={0} max={20} step={1} marks
      disabled={disabled}
    />
    <CustomNumberInput
      value={sliderHigh}
      onChange={val => setHigh(clamp(val, levelLow, 20))}
      sx={{ px: 1, width: 50, }}
      inputProps={{ sx: { textAlign: "center" } }}
      disabled={disabled}
    />
  </Card>
}

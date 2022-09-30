import { Card, Slider } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { clamp } from "../../Util/Util"
import CustomNumberInput from "../CustomNumberInput"

export default function RVSlide({ levelLow, levelHigh, setLow, setHigh, setBoth, dark = false, disabled = false, }: {
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
      sx={{ px: 1, pl: 2, width: 100 }}
      inputProps={{ sx: { textAlign: "right" } }}
      startAdornment={"RV: "}
      disabled={disabled}
    />
    <Slider sx={{ width: 100, flexGrow: 1, mx: 2 }}
      getAriaLabel={() => 'Arifact RV Range'}
      value={[sliderLow, sliderHigh]}
      onChange={setSlider}
      onChangeCommitted={(e, value) => setBoth(value[0], value[1])}
      valueLabelDisplay="auto"
      min={0} max={900}
      disabled={disabled}
    />
    <CustomNumberInput
      value={sliderHigh}
      onChange={val => setHigh(clamp(val, levelLow, 900))}
      sx={{ px: 1, width: 50, }}
      inputProps={{ sx: { textAlign: "center" } }}
      disabled={disabled}
    />
  </Card>
}

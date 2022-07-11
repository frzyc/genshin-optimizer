import { Box, Grid, ToggleButton } from "@mui/material"
import KeyMap from "../../KeyMap"
import { allSubstatKeys } from "../../Types/artifact"
import SolidToggleButtonGroup from "../SolidToggleButtonGroup"
import StatIcon from "../StatIcon"

export default function SubstatToggle({ selectedKeys, onChange }) {
  const keys1 = allSubstatKeys.slice(0, 6)
  const keys2 = allSubstatKeys.slice(6)
  const selKeys1 = selectedKeys.filter(k => keys1.includes(k))
  const selKeys2 = selectedKeys.filter(k => keys2.includes(k))
  return <Grid container spacing={1}>
    <Grid item xs={12} md={6}>
      <SolidToggleButtonGroup fullWidth value={selKeys1} onChange={(e, arr) => onChange([...selKeys2, ...arr])} sx={{ height: "100%" }}>
        {keys1.map(key => <ToggleButton size="small" key={key} value={key}>
          <Box display="flex" gap={1} alignItems="center">
            {StatIcon[key]}
            {KeyMap.getArtStr(key)}
          </Box>
        </ToggleButton>)}
      </SolidToggleButtonGroup>
    </Grid>
    <Grid item xs={12} md={6}>
      <SolidToggleButtonGroup fullWidth value={selKeys2} onChange={(e, arr) => onChange([...selKeys1, ...arr])} sx={{ height: "100%" }}>
        {keys2.map(key => <ToggleButton size="small" key={key} value={key}>
          <Box display="flex" gap={1} alignItems="center">
            {StatIcon[key]}
            {KeyMap.getArtStr(key)}
          </Box>
        </ToggleButton>)}
      </SolidToggleButtonGroup>
    </Grid>
  </Grid>
}

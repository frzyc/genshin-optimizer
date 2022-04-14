import { MenuItem } from "@mui/material"
import DropdownButton from "../../Components/DropdownMenu/DropdownButton"

const levels = {
  0: <span>No Main Stat level assumption</span>,
  4: <span>Assume at least level 4</span>,
  8: <span>Assume at least level 8</span>,
  12: <span>Assume at least level 12</span>,
  16: <span>Assume at least level 16</span>,
  20: <span>Assume at least level 20</span>
} as const
export default function AssumeFullLevelToggle({ mainStatAssumptionLevel = 0, setmainStatAssumptionLevel, disabled }) {
  return <DropdownButton color={mainStatAssumptionLevel ? "warning" : "primary"} disabled={disabled} title={levels[mainStatAssumptionLevel]}>
    {Object.entries(levels).map(([key, text]) => <MenuItem key={key} onClick={() => setmainStatAssumptionLevel(parseInt(key))}>{text}</MenuItem>)}
  </DropdownButton>
}

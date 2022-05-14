import { MenuItem } from "@mui/material"
import { useTranslation } from "react-i18next"
import DropdownButton from "../../../../../Components/DropdownMenu/DropdownButton"

const levels = [0, 4, 8, 12, 16, 20] as const
export default function AssumeFullLevelToggle({ mainStatAssumptionLevel = 0, setmainStatAssumptionLevel, disabled }) {
  const { t } = useTranslation("page_character")
  return <DropdownButton fullWidth color={mainStatAssumptionLevel ? "success" : "primary"} disabled={disabled}
    title={mainStatAssumptionLevel ? t("tabOptimize.assumptionLvl.lvl", { lvl: mainStatAssumptionLevel }) : t("tabOptimize.assumptionLvl.no")}>
    {levels.map((lvl) => <MenuItem key={lvl} onClick={() => setmainStatAssumptionLevel(lvl)}>{lvl ? t("tabOptimize.assumptionLvl.lvl", { lvl }) : t("tabOptimize.assumptionLvl.no")}</MenuItem>)}
  </DropdownButton>
}

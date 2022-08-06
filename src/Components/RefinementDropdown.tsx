import { MenuItem } from "@mui/material"
import { useTranslation } from "react-i18next"
import { allRefinement, Refinement } from "../Types/consts"
import DropdownButton from "./DropdownMenu/DropdownButton"

export default function RefinementDropdown({ refinement, setRefinement }: { refinement: Refinement, setRefinement: (r: Refinement) => void }) {
  const { t } = useTranslation("ui")
  return <DropdownButton title={t("refinement", { value: refinement })}>
    {allRefinement.map(r =>
      <MenuItem key={r} onClick={() => setRefinement(r)} selected={refinement === r} disabled={refinement === r}>
        {t("refinement", { value: r })}
      </MenuItem>)}
  </DropdownButton>
}

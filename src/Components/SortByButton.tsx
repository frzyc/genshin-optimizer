import { faSortAmountDownAlt, faSortAmountUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, ButtonGroup, ButtonGroupProps, MenuItem } from "@mui/material";
import { Box } from "@mui/system";
import { Trans, useTranslation } from "react-i18next";
import DropdownButton from "./DropdownMenu/DropdownButton";

type SortByButtonProps = ButtonGroupProps & {
  sortKeys: string[]
  value: string
  onChange: (value: string) => void
  ascending: boolean
  onChangeAsc: (value: boolean) => void
}
// Assumes that all the sortKeys has corresponding translations in ui.json sortMap
export default function SortByButton({ sortKeys, value, onChange, ascending, onChangeAsc, ...props }: SortByButtonProps) {
  const { t } = useTranslation("ui")
  return <Box display="flex" alignItems="center" gap={1}>
    <Trans t={t} i18nKey={t("sortBy") as any}>Sort by: </Trans>
    <ButtonGroup {...props} >
      <DropdownButton title={<Trans t={t} i18nKey={t(`sortMap.${value}`) as any}>{{ value: t(`sortMap.${value}`) }}</Trans>}>
        {sortKeys.map(key =>
          <MenuItem key={key} selected={value === key} disabled={value === key} onClick={() => onChange(key)}>{t(`sortMap.${key}`) as any}</MenuItem>)}
      </DropdownButton>
      <Button onClick={() => onChangeAsc(!ascending)} startIcon={<FontAwesomeIcon icon={ascending ? faSortAmountDownAlt : faSortAmountUp} className="fa-fw" />}>
        {ascending ? <Trans t={t} i18nKey="ascending" >Ascending</Trans> : <Trans t={t} i18nKey="descending" >Descending</Trans>}
      </Button>
    </ButtonGroup>
  </Box>
}

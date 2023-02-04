import { allRarities, Rarity } from "@genshin-optimizer/consts";
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { Box, Chip, ToggleButton, useMediaQuery, useTheme } from "@mui/material";
import { handleMultiSelect } from "../../Util/MultiSelect";
import SolidToggleButtonGroup, { SolidToggleButtonGroupProps } from "../SolidToggleButtonGroup";
type RarityToggleProps = Omit<SolidToggleButtonGroupProps, "onChange" | "value"> & {
  onChange: (value: Rarity[]) => void
  value: Rarity[],
  totals: Record<Rarity, Displayable>
}
const rarityHandler = handleMultiSelect([...allRarities])
export default function RarityToggle({ value, totals, onChange, ...props }: RarityToggleProps) {
  const theme = useTheme();
  const xs = !useMediaQuery(theme.breakpoints.up('sm'));
  return <SolidToggleButtonGroup exclusive value={value} {...props}>
    {allRarities.map(star =>
      <ToggleButton key={star} value={star} sx={{ p: xs ? 1 : undefined, minWidth: xs ? 0 : "7em", display: "flex", gap: xs ? 0 : 1 }} onClick={() => onChange(rarityHandler(value, star))}>
        <Box display="flex">
          <strong>{star}</strong>
          <StarRoundedIcon />
          <Chip label={totals[star]} size="small" />
        </Box></ToggleButton>)}
  </SolidToggleButtonGroup>
}

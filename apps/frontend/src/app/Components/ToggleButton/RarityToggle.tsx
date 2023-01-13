import { Box, Chip, ToggleButton } from "@mui/material";
import { allRarities, Rarity } from "../../Types/consts";
import { handleMultiSelect } from "../../Util/MultiSelect";
import SolidToggleButtonGroup, { SolidToggleButtonGroupProps } from "../SolidToggleButtonGroup";
import { StarsDisplay } from "../StarDisplay";
type RarityToggleProps = Omit<SolidToggleButtonGroupProps, "onChange" | "value"> & {
  onChange: (value: Rarity[]) => void
  value: Rarity[],
  totals: Record<Rarity, number>
}
const rarityHandler = handleMultiSelect([...allRarities])
export default function RarityToggle({ value, totals, onChange, ...props }: RarityToggleProps) {
  return <SolidToggleButtonGroup exclusive value={value} {...props}>
  {allRarities.map(star =>
    <ToggleButton key={star} value={star} onClick={() => onChange(rarityHandler(value, star))}>
      <Box display="flex">
        <strong>{star}</strong>
        <StarsDisplay stars={1} />
        <Chip label={totals[star]} size="small" />
      </Box></ToggleButton>)}
</SolidToggleButtonGroup>
}

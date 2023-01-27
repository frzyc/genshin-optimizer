import { Rarity } from '@genshin-optimizer/consts';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ColorText from './ColoredText';
export const StarsDisplay = ({ stars, colored = false }: { stars: Rarity, colored?: boolean }) =>
  <ColorText color={colored ? "warning" : undefined} >
    {stars ? [...Array(stars).keys()].map((_, i) => <StarRoundedIcon key={i} fontSize="inherit" sx={{ verticalAlign: "-10%" }} />) : null}
  </ColorText>

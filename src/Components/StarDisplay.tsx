import { faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Typography } from '@mui/material'
import { Rarity } from '../Types/consts'

const StarIcon = () => <FontAwesomeIcon icon={faStar} />
const Stars = ({ stars, colored = false }: { stars: Rarity, colored?: boolean }) =>
  <Typography color={colored ? "warning.main" : undefined} component="span">
    {stars ? [...Array(stars).keys()].map((_, i) => <StarIcon key={i} />) : null}
  </Typography>

export {
  StarIcon,
  Stars
}

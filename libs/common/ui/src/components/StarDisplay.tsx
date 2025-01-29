import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { ColorText } from './ColorText'

export function StarsDisplay<S extends number>({
  stars = 1 as S,
  colored = false,
  inline = false,
}: {
  stars?: S
  colored?: boolean
  inline?: boolean
}) {
  return (
    <ColorText color={colored ? 'warning' : undefined}>
      {[...Array(stars).keys()].map((_, i) => (
        <StarRoundedIcon
          key={i}
          fontSize={inline ? 'inherit' : undefined}
          sx={inline ? { verticalAlign: 'text-top' } : undefined}
        />
      ))}
    </ColorText>
  )
}

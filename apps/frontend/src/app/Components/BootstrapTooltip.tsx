import type { TooltipProps } from '@mui/material'
import { styled, Tooltip, tooltipClasses } from '@mui/material'

const BootstrapTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
    maxWidth: 500,
  },
}))
export default BootstrapTooltip

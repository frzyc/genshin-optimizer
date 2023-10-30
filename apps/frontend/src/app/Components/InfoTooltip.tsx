import InfoIcon from '@mui/icons-material/Info'
import type { TooltipProps } from '@mui/material'
import BootstrapTooltip from './BootstrapTooltip'
/**
 * @deprecated use `InfoTooltip` in `@genshin-optimizer/ui-common`
 */
export default function InfoTooltip(props: Omit<TooltipProps, 'children'>) {
  return (
    <BootstrapTooltip placement="top" {...props}>
      <InfoIcon sx={{ cursor: 'help' }} />
    </BootstrapTooltip>
  )
}

/**
 * @deprecated use `InfoTooltipInline` in `@genshin-optimizer/ui-common`
 */
export function InfoTooltipInline(props: Omit<TooltipProps, 'children'>) {
  return (
    <BootstrapTooltip placement="top" {...props}>
      <InfoIcon
        fontSize="inherit"
        sx={{ cursor: 'help', verticalAlign: '-10%' }}
      />
    </BootstrapTooltip>
  )
}

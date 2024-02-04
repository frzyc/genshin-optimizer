import type { SvgIconProps } from '@mui/material'
export * from './icons/DiscordIcon'
export * from './icons/FriendshipIcon'
export * from './icons/PatreonIcon'
export * from './icons/PaypalIcon'
export * from './icons/TwitchIcon'
export * from './icons/AnvilIcon'

export const iconInlineProps: SvgIconProps = {
  fontSize: 'inherit',
  sx: {
    verticalAlign: '-10%',
  },
} as const

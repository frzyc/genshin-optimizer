import { Android as AndroidIcon, Apple as AppleIcon } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  CardContent,
  Divider,
  Typography,
} from '@mui/material'
import CardDark from '../Components/Card/CardDark'
import silly_icon from '../silly_icon.png'
import DiscordIcon from '../SVGIcons/DiscordIcon'
export default function SillyCard() {
  return (
    <CardDark>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={silly_icon} />
        <Typography variant="h5"> Silly Wisher has taken over GO!</Typography>
      </CardContent>
      <Divider />
      <CardContent>
        <Typography>
          We <s>stole</s> borrowed(with permission) all the character assets
          from <strong>Silly Wisher</strong> for the day.
        </Typography>
        <Box display="flex" gap={2} pt={2}>
          <Button
            startIcon={<DiscordIcon />}
            color="discord"
            href="https://discord.com/invite/sillywisher"
            target="_blank"
          >
            Discord
          </Button>
          <Button
            startIcon={<AppleIcon />}
            href="https://apps.apple.com/lv/app/silly-wisher/id6444465724"
            target="_blank"
          >
            App Store
          </Button>
          <Button
            startIcon={<AndroidIcon />}
            href="https://play.google.com/store/apps/details?id=com.sketchi.sillywisher"
            target="_blank"
          >
            Play Store
          </Button>
        </Box>
      </CardContent>
    </CardDark>
  )
}

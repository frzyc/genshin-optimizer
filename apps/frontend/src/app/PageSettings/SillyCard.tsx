import { DiscordIcon } from '@genshin-optimizer/common/svgicons'
import { Android as AndroidIcon, Apple as AppleIcon } from '@mui/icons-material'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import {
  Avatar,
  Box,
  Button,
  CardContent,
  Divider,
  Typography,
} from '@mui/material'
import { useContext } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import CardLight from '../Components/Card/CardLight'
import { SillyContext } from '../Context/SillyContext'
import silly_icon from '../silly_icon.png'
export default function SillyCard() {
  const { silly, setSilly } = useContext(SillyContext)
  const { t } = useTranslation(['ui', 'settings'])
  return (
    <CardLight>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={silly_icon} />
        <Typography variant="h5"> {t`sillyPageTitle`}</Typography>
      </CardContent>
      <Divider />
      <CardContent>
        <Typography>
          <Trans t={t} i18nKey="settings:sillyCard.desc">
            We <s>stole</s> borrowed (with permission) all the character assets
            from <strong>Silly Wisher</strong> and gene splice it into Genshin
            Optimizer.
          </Trans>
        </Typography>
        <Box display="flex" gap={2} pt={2}>
          <Button
            onClick={() => setSilly(!silly)}
            startIcon={silly ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
            color={silly ? 'success' : 'secondary'}
          >
            {silly
              ? t`settings:sillyCard.toggle.enabled`
              : t`settings:sillyCard.toggle.disabled`}
          </Button>
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
            Google Play
          </Button>
        </Box>
      </CardContent>
    </CardLight>
  )
}

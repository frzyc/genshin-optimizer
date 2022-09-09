import { faDiscord } from "@fortawesome/free-brands-svg-icons"
import { Backpack, Computer, Download, Gamepad, InsertLink, PersonSearch, SendToMobile, SportsEsports, Warning } from "@mui/icons-material"
import { Box, CardContent, CardMedia, Grid, IconButton, Link, Tooltip, Typography } from "@mui/material"
import ReactGA from 'react-ga4'
import { Trans, useTranslation } from 'react-i18next'
import { Link as RouterLink } from "react-router-dom"
import CardDark from "../Components/Card/CardDark"
import FontAwesomeSvgIcon from "../Components/FontAwesomeSvgIcon"
import SqBadge from "../Components/SqBadge"
import AdScanner from './AdeptiScanner.png'
import Amenoma from './Amenoma.png'
import GIScanner from './GIScanner.png'
import Artiscan from './artiscan.png'

export default function PageScanner() {
  const { t } = useTranslation('page_scanner')
  ReactGA.send({ hitType: "pageview", page: '/scanner' })
  return <Box display="flex" flexDirection="column" gap={2} my={1}>
    <CardDark><CardContent>
      <Trans t={t} i18nKey="intro">
        <Typography variant="h5">Scanners</Typography>
        <Typography gutterBottom>Scanners are Genshin tools that can automatically scan game data from screenshots or directly from the game.</Typography>
        <Typography gutterBottom>Below are several scanners that have been tested with GO.</Typography>
        <Typography variant="subtitle2">To upload the exported file, go to <Link component={RouterLink} to="/setting">Settings</Link> page, and upload your file in the <strong>Database Upload</strong> section.</Typography>
      </Trans>
    </CardContent></CardDark>

    <Grid container columns={{ xs: 1, md: 2, lg: 3 }} spacing={2}>
      <Grid item xs={1}>
        <CardDark sx={{ height: "100%" }}>
          <CardMedia component="img" image={Artiscan} />
          <CardContent>
            <Box display="flex" gap={1} alignItems="center">
              <Typography variant="h5" flexGrow={1} ><Trans t={t} i18nKey="nb.title">Artiscan</Trans></Typography>
              <IconButton href="https://artiscan.ninjabay.org/" target="_blank">
                <InsertLink />
              </IconButton>
            </Box>

            <Typography variant="subtitle2" sx={{ display: "flex", gap: 1, py: 1, flexWrap: "wrap" }}>
              <SqBadge color="success" sx={{ display: "flex", alignItems: "center" }} ><Gamepad sx={{ pr: 0.5 }} />3.0</SqBadge>
              <SqBadge sx={{ display: "flex", alignItems: "center" }} ><Computer sx={{ pr: 0.5 }} />{t("tags.pc") as string}</SqBadge>
              <SqBadge sx={{ display: "flex", alignItems: "center" }} ><SendToMobile sx={{ pr: 0.5 }} />{t("tags.mobile") as string}</SqBadge>
              <SqBadge sx={{ display: "flex", alignItems: "center" }} ><SportsEsports sx={{ pr: 0.5 }} />{t("tags.ps") as string}</SqBadge>
            </Typography>
            <Typography gutterBottom>{t("nb.p1") as string}</Typography>
            <Typography gutterBottom>{t("nb.p2") as string}</Typography>
            <Typography gutterBottom>{t("nb.p3") as string}</Typography>
          </CardContent>
        </CardDark>
      </Grid>
      <Grid item xs={1}>
        <CardDark sx={{ height: "100%" }}>
          <CardMedia component="img" image={GIScanner} />
          <CardContent>
            <Box display="flex" gap={1} alignItems="center">
              <Typography variant="h5" flexGrow={1} ><Trans t={t} i18nKey="ik.title">Inventory Kamera</Trans></Typography>
              <IconButton href="https://github.com/Andrewthe13th/Inventory_Kamera" target="_blank">
                <Download />
              </IconButton>
            </Box>

            <Typography variant="subtitle2" sx={{ display: "flex", gap: 1, py: 1, flexWrap: "wrap" }}>
              <SqBadge color="success" sx={{ display: "flex", alignItems: "center" }} ><Gamepad sx={{ pr: 0.5 }} />3.0</SqBadge>
              <SqBadge sx={{ display: "flex", alignItems: "center" }} ><Computer sx={{ pr: 0.5 }} />{t("tags.pc") as string}</SqBadge>
              <SqBadge sx={{ display: "flex", alignItems: "center" }} ><Backpack sx={{ pr: 0.5 }} />{t("tags.materials") as string}</SqBadge>
              <SqBadge sx={{ display: "flex", alignItems: "center" }} ><PersonSearch sx={{ pr: 0.5 }} />{t("tags.characters") as string}</SqBadge>
              <WarningWrapper>
                <SqBadge color="warning" sx={{ display: "flex", alignItems: "center" }} ><Warning sx={{ pr: 0.5 }} />{t("tags.gameMani") as string}</SqBadge>
              </WarningWrapper>
            </Typography>
            <Typography gutterBottom><Trans t={t} i18nKey="ik.p1">This light-weight app will scan all your characters + weapons + artifacts in your inventory. Follow the instrutions in the app to set it up.</Trans></Typography>
            <Typography gutterBottom><Trans t={t} i18nKey="ik.p2">This scanner can also scan materials for <Link href="https://seelie.me/" target="_blank" rel="noreferrer">Seelie.me</Link></Trans></Typography>
            <Typography gutterBottom><Trans t={t} i18nKey="goodeng">This scanner only scans in english, and exports to GOOD format.</Trans></Typography>
          </CardContent>
        </CardDark>
      </Grid>
      <Grid item xs={1}>
        <CardDark sx={{ height: "100%" }}>
          <CardMedia component="img" image={AdScanner} />
          <CardContent>
            <Box display="flex" gap={1} alignItems="center">
              <Typography variant="h5" flexGrow={1} ><Trans t={t} i18nKey="as.title">AdeptiScanner</Trans></Typography>
              <IconButton href="https://github.com/D1firehail/AdeptiScanner-GI" target="_blank">
                <Download />
              </IconButton>
            </Box>

            <Typography variant="subtitle2" sx={{ display: "flex", gap: 1, py: 1, flexWrap: "wrap" }}>
              <SqBadge color="success" sx={{ display: "flex", alignItems: "center" }} ><Gamepad sx={{ pr: 0.5 }} />3.0</SqBadge>
              <SqBadge sx={{ display: "flex", alignItems: "center" }} ><Computer sx={{ pr: 0.5 }} />{t("tags.pc") as string}</SqBadge>
              <WarningWrapper>
                <SqBadge color="warning" sx={{ display: "flex", alignItems: "center" }} ><Warning sx={{ pr: 0.5 }} />{t("tags.gameMani") as string}</SqBadge>
              </WarningWrapper>
            </Typography>
            <Typography gutterBottom><Trans t={t} i18nKey="as.p1">Scans all artifacts in your inventory. Has a manual scanning mode.</Trans></Typography>
            <Typography gutterBottom><Trans t={t} i18nKey="as.p2">This scanner can also be configured for new artifacts in new game versions without needing an update.</Trans></Typography>
            <Typography gutterBottom><Trans t={t} i18nKey="goodeng">This scanner only scans in english, and exports to GOOD format.</Trans></Typography>
          </CardContent>
        </CardDark>
      </Grid>
      <Grid item xs={1}>
        <CardDark sx={{ height: "100%" }}>
          <CardMedia component="img" image={Amenoma} />
          <CardContent>
            <Box display="flex" gap={1} alignItems="center">
              <Typography variant="h5" flexGrow={1} ><Trans t={t} i18nKey="am.title">「天目」-- Amenoma</Trans></Typography>
              <IconButton href="https://discord.gg/BTrCYgVGFP" target="_blank">
                <FontAwesomeSvgIcon icon={faDiscord} />
              </IconButton>
              <IconButton href="https://github.com/daydreaming666/Amenoma" target="_blank">
                <Download />
              </IconButton>
            </Box>

            <Typography variant="subtitle2" sx={{ display: "flex", gap: 1, py: 1, flexWrap: "wrap" }}>
              <SqBadge color="success" sx={{ display: "flex", alignItems: "center" }} ><Gamepad sx={{ pr: 0.5 }} />3.0</SqBadge>
              <SqBadge sx={{ display: "flex", alignItems: "center" }} ><Computer sx={{ pr: 0.5 }} />{t("tags.pc") as string}</SqBadge>
              <SqBadge sx={{ display: "flex", alignItems: "center" }} ><Backpack sx={{ pr: 0.5 }} />{t("tags.materials") as string}</SqBadge>
              <WarningWrapper>
                <SqBadge color="warning" sx={{ display: "flex", alignItems: "center" }} ><Warning sx={{ pr: 0.5 }} />{t("tags.gameMani") as string}</SqBadge>
              </WarningWrapper>
            </Typography>
            <Typography gutterBottom><Trans t={t} i18nKey="am.p1">Scans all you artifacts in your inventory. Follow the instruction to capture the window and scan. Has both Chinese and English versions. (Download the <code>_EN.exe</code> version to scan in english). Only the<code>GOOD</code> format is accepted in GO.</Trans></Typography>
            <Typography gutterBottom><Trans t={t} i18nKey="am.p2">This scanner can also scan materials for <Link href="https://seelie.me/" target="_blank" rel="noreferrer">Seelie.me</Link></Trans></Typography>
          </CardContent>
        </CardDark>
      </Grid>
    </Grid>
  </Box >
}

function WarningWrapper({ children }: { children: JSX.Element }) {
  const { t } = useTranslation('page_scanner')
  return <Tooltip placement="top" title={<Typography><Trans t={t} i18nKey="tosWarn">As any tools that indirectly interact with the game, although their usage is virtually undetectable, <Link color="inherit" href="https://genshin.mihoyo.com/en/news/detail/5763" target="_blank" rel="noreferrer">there could still be risk with using them.</Link> Users discretion is advised.</Trans></Typography>}>
    {children}
  </Tooltip>
}

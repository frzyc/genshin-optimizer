import { faDiscord } from "@fortawesome/free-brands-svg-icons"
import { faDownload, faHome } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Box, Button, CardContent, Grid, Link, Typography } from "@mui/material"
import ReactGA from 'react-ga4'
import { Trans, useTranslation } from 'react-i18next'
import { Link as RouterLink } from "react-router-dom"
import CardDark from "../Components/Card/CardDark"
import ImgFullwidth from "../Components/Image/ImgFullwidth"
import SqBadge from "../Components/SqBadge"
import AdScanner from './AdeptiScanner.png'
import Amenoma from './Amenoma.png'
import GIScanner from './GIScanner.png'

export default function PageScanner(props: any) {
  const { t: ui } = useTranslation('ui')
  const { t } = useTranslation('page_scanner')
  ReactGA.send({ hitType: "pageview", page: '/scanner' })
  return <Box display="flex" flexDirection="column" gap={1} my={1}>
    <CardDark><CardContent>
      <Trans t={t} i18nKey="intro">
        <Typography variant="h5">Automatic Scanners</Typography>
        <Typography gutterBottom>Automatic Scanners are Genshin tools that can automatically scan in-game data by manipulating your mouse movements, taking screenshots of the game, and then scanning information from those screenshots. These are low-risk tools that can help you automate a lot of manual process with scanning artifacts for GO. As any tools that indirectly interact with the game, althought their usage is virtually undetectable, <Link href="https://genshin.mihoyo.com/en/news/detail/5763" target="_blank" rel="noreferrer">there could still be risk with using them.</Link> Users discretion is advised.
        </Typography>
        <Typography >The most important aspect of using these Scanners with GO is the output format:</Typography>
        <Typography gutterBottom component="div">
          <ul>
            <li>As of <code>v5.21.0</code>, GO can import artifact data in the <code>mona-uranai</code> format. </li>
            <li>As of <code>v6.0.0</code>, GO can import data in the <code>Genshin Open Object Description (GOOD)</code> format.</li>
          </ul>
        </Typography>
        <Typography gutterBottom>Below are several scanners that have been tested with GO.</Typography>
        <Typography>To upload the exported file, go to <Link component={RouterLink} to="/setting">Settings</Link> page, and upload your file in the <strong>Database Upload</strong> section.</Typography>
      </Trans>
    </CardContent></CardDark>

    <CardDark><CardContent><Grid container spacing={2} >
      <Grid item xs={12} md={4}><ImgFullwidth src={GIScanner} /></Grid>
      <Grid item xs={12} md={8}>
        <Typography variant="h5"><Trans t={t} i18nKey="ik.title">Inventory Kamera</Trans><SqBadge color="success" sx={{ ml: 1 }}><Trans t={ui} i18nKey="updatedfor" values={{ version: "2.6" }} /></SqBadge></Typography>
        <Typography gutterBottom><Trans t={t} i18nKey="ik.p1">This light-weight app will scan all your characters + weapons + artifacts in your inventory. Follow the instrutions in the app to set it up.</Trans></Typography>
        <Typography gutterBottom><Trans t={t} i18nKey="ik.p2">This scanner can also scan materials for <Link href="https://seelie.me/" target="_blank" rel="noreferrer">Seelie.me</Link></Trans></Typography>
        <Typography gutterBottom><Trans t={t} i18nKey="goodeng">This scanner only scans in english, and exports to GOOD format.</Trans></Typography>
        <Button href="https://github.com/Andrewthe13th/Inventory_Kamera" target="_blank" startIcon={<FontAwesomeIcon icon={faDownload} />} ><Trans t={ui} i18nKey="link.download" /></Button>
      </Grid>
    </Grid></CardContent></CardDark>

    <CardDark><CardContent><Grid container spacing={2} >
      <Grid item xs={12} md={8}>
        <Typography variant="h5"><Trans t={t} i18nKey="as.title">AdeptiScanner</Trans><SqBadge color="success" sx={{ ml: 1 }}><Trans t={ui} i18nKey="updatedfor" values={{ version: "2.6+" }} /></SqBadge></Typography>
        <Typography gutterBottom><Trans t={t} i18nKey="as.p1">Scans all your artifacts in inventory. Has a manual scanning mode.</Trans></Typography>
        <Typography gutterBottom><Trans t={t} i18nKey="as.p2">This scanner can also be configured for new artifacts in new game versions without needing an update.</Trans></Typography>
        <Typography gutterBottom><Trans t={t} i18nKey="goodeng">This scanner only scans in english, and exports to GOOD format.</Trans></Typography>
        <Button href="https://github.com/D1firehail/AdeptiScanner-GI" target="_blank" startIcon={<FontAwesomeIcon icon={faDownload} />} ><Trans t={ui} i18nKey="link.download" /></Button>
      </Grid>
      <Grid item xs={12} md={4}><ImgFullwidth src={AdScanner} /></Grid>
    </Grid></CardContent></CardDark>

    <CardDark><CardContent><Grid container spacing={2} >
      <Grid item xs={12} md={4}><ImgFullwidth src={Amenoma} /></Grid>
      <Grid item xs={12} md={8}>
        <Typography variant="h5"><Trans t={t} i18nKey="am.title">「天目」-- Amenoma</Trans><SqBadge color="success" sx={{ ml: 1 }}><Trans t={ui} i18nKey="updatedfor" values={{ version: "2.6" }} /></SqBadge></Typography>
        <Typography gutterBottom><Trans t={t} i18nKey="am.p1">Scans all you artifacts in your inventory. Follow the instruction to capture the window and scan. Has both Chinese and English version. (Download the <code>_EN.exe</code> version to scan in english). Both the <code>mona-uranai</code> and <code>GOOD</code> format is accepted in GO. the <code>GOOD</code> format is recommended.</Trans></Typography>
        <Typography gutterBottom><Trans t={t} i18nKey="am.p2">Beta version of this scanner can also scan materials for <Link href="https://seelie.me/" target="_blank" rel="noreferrer">Seelie.me</Link></Trans></Typography>
        <Button sx={{ mb: 2 }} href="https://github.com/daydreaming666/Amenoma" target="_blank" startIcon={<FontAwesomeIcon icon={faDownload} />} ><Trans t={ui} i18nKey="link.download" /></Button>
        <Typography gutterBottom><Trans t={t} i18nKey="am.p3">Please feel free to join their discord if you find any bugs. They are in need of more english testers.</Trans></Typography>
        <Button href="https://discord.gg/BTrCYgVGFP" target="_blank" startIcon={<FontAwesomeIcon icon={faDiscord} />} ><Trans t={ui} i18nKey="link.discord" /></Button>
      </Grid>
    </Grid></CardContent></CardDark>

    <CardDark><CardContent>
      <Button component={RouterLink} to="/" startIcon={<FontAwesomeIcon icon={faHome} />}><Trans t={t} i18nKey="backHome">Go back to home page</Trans></Button>
    </CardContent></CardDark>
  </Box >
}

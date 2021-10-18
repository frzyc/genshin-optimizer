import { faDiscord } from "@fortawesome/free-brands-svg-icons"
import { faDownload, faHome } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Alert, Box, Button, CardContent, Grid, Link, Typography } from "@mui/material"
import ReactGA from 'react-ga'
import { Trans, useTranslation } from 'react-i18next'
import { Link as RouterLink } from "react-router-dom"
import CardDark from "../Components/Card/CardDark"
import ImgFullwidth from "../Components/Image/ImgFullwidth"
import Amenoma from './Amenoma.png'
import cocogoat from './cocogoat.png'
import GIScanner from './GIScanner.png'

export default function ScannerDisplay(props: any) {
  const { t } = useTranslation('page_scannerd')
  ReactGA.pageview('/scanner')
  return <Box sx={{
    mt: 1,
    "> div": { mb: 1 },
  }}>
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
        <Typography>To upload the exported file, go to <Link component={RouterLink} to="/database">Database</Link> page, and upload your file in the "Database Upload" section.</Typography>
      </Trans>
    </CardContent></CardDark>

    <CardDark><CardContent><Grid container spacing={2} >
      <Grid item xs={12} md={4}><ImgFullwidth src={GIScanner} /></Grid>
      <Grid item xs={12} md={8}>
        <Trans t={t} i18nKey="gis">
          <Typography variant="h5">Genshin Impact Scanner</Typography>
          <Typography gutterBottom>This light-weight app will scan all your characters + weapons + artifacts in your inventory. Follow the instrutions in the app to set it up. This scanner only scans in english. </Typography>
          <Typography gutterBottom>The app exports to GOOD format by default.</Typography>
          <Button href="https://github.com/Andrewthe13th/Genshin_Scanner/releases" target="_blank" startIcon={<FontAwesomeIcon icon={faDownload} />} >Download link</Button>
        </Trans>
      </Grid>
    </Grid></CardContent></CardDark>

    <CardDark><CardContent><Grid container spacing={2} >
      <Grid item xs={12} md={8}>
        <Trans t={t} i18nKey="amenoma">
          <Typography variant="h5">「天目」-- Amenoma</Typography>
          <Typography gutterBottom>Scans all you artifacts in your inventory. Follow the instruction to capture the window and scan.</Typography>
          <Typography gutterBottom>Has both Chinese and English version. (Download the <code>_EN.exe</code> version to scan in english)</Typography>
          <Typography gutterBottom>Both the <code>mona-uranai</code> and <code>GOOD</code> format is accepted in GO. the <code>GOOD</code> format is recommended.</Typography>
          <Button sx={{ mb: 2 }} href="https://github.com/daydreaming666/Amenoma/releases/" target="_blank" startIcon={<FontAwesomeIcon icon={faDownload} />} >Download link</Button>
          <Typography gutterBottom>Please feel free to join their discord if you find any bugs. They are in need of more english testers.</Typography>
          <Button href="https://discord.gg/S3B9NB7Bk2" target="_blank" startIcon={<FontAwesomeIcon icon={faDiscord} />} >Discord Invite</Button>
        </Trans>
      </Grid>
      <Grid item xs={12} md={4}><ImgFullwidth src={Amenoma} /></Grid>
    </Grid></CardContent></CardDark>

    <CardDark><CardContent><Grid container spacing={2} >
      <Grid item xs={12} md={4}><ImgFullwidth src={cocogoat} /></Grid>
      <Grid item xs={12} md={8}>
        <Trans t={t} i18nKey="cocogoat">
          <Typography variant="h5">cocogoat</Typography>
          <Typography gutterBottom>Originally Chinese scanner that was ported to English. Has an overlay to scan individual artifacts. </Typography>
          <Typography gutterBottom>Cocogoat also retains your scanned artifacts, where you can edit them individually, and you can use them in its built-in mona-uranai optimizer.(Currently a Chinese-only optimizer)</Typography>
          <Typography gutterBottom>It is recommended to export in its "Mona's Divination Shop" format.</Typography>
          <Button sx={{ mb: 2 }} href="https://github.com/YuehaiTeam/cocogoat/releases" target="_blank" startIcon={<FontAwesomeIcon icon={faDownload} />} >Download link</Button>
          <Alert variant="outlined" severity="warning">WARNING: Do not use the "Genshin Optimizer" export format. importing it will delete your character {"&"} weapon data.</Alert>
        </Trans>
      </Grid>
    </Grid></CardContent></CardDark>

    <CardDark><CardContent>
      <Button component={RouterLink} to="/" startIcon={<FontAwesomeIcon icon={faHome} />}><Trans t={t} i18nKey="backHome">Go back to home page</Trans></Button>
    </CardContent></CardDark>
  </Box >
}
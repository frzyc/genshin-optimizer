import { AnvilIcon, DiscordIcon } from '@genshin-optimizer/common/svgicons'
import { CardThemed, SqBadge } from '@genshin-optimizer/common/ui'
import { FlowerIcon } from '@genshin-optimizer/gi/svgicons'
import {
  Backpack,
  Computer,
  Download,
  EmojiEvents,
  InsertLink,
  PersonSearch,
  SendToMobile,
  SportsEsports,
  Warning,
  YouTube,
} from '@mui/icons-material'
import {
  Box,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from '@mui/material'
import ReactGA from 'react-ga4'
import { Trans, useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import AdScanner from './AdeptiScanner.png'
import GIScanner from './GIScanner.png'
import Irminsul from './Irminsul.webp'
import Artiscan from './artiscan.png'

export default function PageScanner() {
  const { t } = useTranslation('page_scanner')
  ReactGA.send({ hitType: 'pageview', page: '/scanner' })
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <CardThemed>
        <CardContent>
          <Trans t={t} i18nKey="intro">
            <Typography gutterBottom variant="h5">
              Scanners
            </Typography>
            <Typography>
              Scanners are Genshin tools that can automatically scan game data
              from screenshots or directly from the game.
            </Typography>
            <Typography gutterBottom>
              Below are several scanners that have been tested with GO.
            </Typography>
            <Typography variant="subtitle2">
              To upload the exported file, go to the
              <Link component={RouterLink} to="/setting">
                Settings
              </Link>
              page, and upload your file in the
              {'<strong>Database Upload</strong>'}
              section.
            </Typography>
          </Trans>
        </CardContent>
      </CardThemed>

      <Grid container columns={{ xs: 1, md: 2, lg: 4 }} spacing={2}>
        <Grid item xs={1}>
          <CardThemed sx={{ height: '100%' }}>
            <CardActionArea
              href="https://artiscan.ninjabay.org/"
              target="_blank"
            >
              <CardMedia component="img" image={Artiscan} />
            </CardActionArea>
            <CardContent>
              <Box display="flex" gap={1} alignItems="center">
                <Typography variant="h5" flexGrow={1}>
                  <Trans t={t} i18nKey="nb.title">
                    Artiscan
                  </Trans>
                </Typography>
                <IconButton
                  href="https://artiscan.ninjabay.org/"
                  target="_blank"
                >
                  <InsertLink />
                </IconButton>
                <IconButton href="https://youtu.be/_qzzunuef4Y" target="_blank">
                  <YouTube />
                </IconButton>
              </Box>

              <Typography
                variant="subtitle2"
                sx={{ display: 'flex', gap: 1, py: 1, flexWrap: 'wrap' }}
              >
                <SqBadge sx={{ display: 'flex', alignItems: 'center' }}>
                  <Computer sx={{ pr: 0.5 }} />
                  {t('tags.pc') as string}
                </SqBadge>
                <SqBadge sx={{ display: 'flex', alignItems: 'center' }}>
                  <SendToMobile sx={{ pr: 0.5 }} />
                  {t('tags.mobile') as string}
                </SqBadge>
                <SqBadge sx={{ display: 'flex', alignItems: 'center' }}>
                  <SportsEsports sx={{ pr: 0.5 }} />
                  {t('tags.ps') as string}
                </SqBadge>
              </Typography>
              <Typography gutterBottom>{t('nb.p1') as string}</Typography>
              <Typography gutterBottom>{t('nb.p2') as string}</Typography>
              <Typography gutterBottom>{t('nb.p3') as string}</Typography>
              <Typography gutterBottom>
                <Trans t={t} i18nKey="goodeng">
                  This app only scans in English and exports to
                  <code>GOOD</code>
                  format.
                </Trans>
              </Typography>
            </CardContent>
          </CardThemed>
        </Grid>
        <Grid item xs={1}>
          <CardThemed sx={{ height: '100%' }}>
            <CardActionArea
              href="https://github.com/taiwenlee/Inventory_Kamera/blob/master/README.md"
              target="_blank"
            >
              <CardMedia component="img" image={GIScanner} />
            </CardActionArea>
            <CardContent>
              <Box display="flex" gap={1} alignItems="center">
                <Typography variant="h5" flexGrow={1}>
                  <Trans t={t} i18nKey="ik.title">
                    Inventory Kamera
                  </Trans>
                </Typography>
                <IconButton
                  href="https://discord.gg/zh56aVWe3U"
                  target="_blank"
                >
                  <DiscordIcon />
                </IconButton>
                <IconButton
                  href="https://github.com/taiwenlee/Inventory_Kamera/blob/master/README.md"
                  target="_blank"
                >
                  <Download />
                </IconButton>
              </Box>

              <Typography
                variant="subtitle2"
                sx={{ display: 'flex', gap: 1, py: 1, flexWrap: 'wrap' }}
              >
                <SqBadge sx={{ display: 'flex', alignItems: 'center' }}>
                  <Computer sx={{ pr: 0.5 }} />
                  {t('tags.pc') as string}
                </SqBadge>
                <SqBadge sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonSearch sx={{ pr: 0.5 }} />
                  {t('tags.characters') as string}
                </SqBadge>
                <SqBadge
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <AnvilIcon />
                  {t('tags.weapons') as string}
                </SqBadge>
                <SqBadge sx={{ display: 'flex', alignItems: 'center' }}>
                  <Backpack sx={{ pr: 0.5 }} />
                  {t('tags.materials') as string}
                </SqBadge>
                <Tooltip
                  placement="top"
                  title={<Typography>{t('addlArtiText')}</Typography>}
                >
                  <SqBadge sx={{ display: 'flex', alignItems: 'center' }}>
                    <FlowerIcon sx={{ pr: 0.5 }} />
                    {t('tags.addlArti') as string}
                  </SqBadge>
                </Tooltip>
                <WarningWrapper>
                  <SqBadge
                    color="warning"
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <Warning sx={{ pr: 0.5 }} />
                    {t('tags.gameMani') as string}
                  </SqBadge>
                </WarningWrapper>
              </Typography>
              <Typography gutterBottom>
                <Trans t={t} i18nKey="ik.p1"></Trans>
              </Typography>
              <Typography gutterBottom>
                <Trans t={t} i18nKey="seelieme">
                  This app can also scan materials for
                  <Link
                    href="https://seelie.me/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Seelie.me
                  </Link>
                </Trans>
              </Typography>
              <Typography gutterBottom>
                <Trans t={t} i18nKey="goodeng">
                  This app only scans in English and exports to
                  <code>GOOD</code>
                  format.
                </Trans>
              </Typography>
            </CardContent>
          </CardThemed>
        </Grid>
        <Grid item xs={1}>
          <CardThemed sx={{ height: '100%' }}>
            <CardActionArea
              href="https://github.com/D1firehail/AdeptiScanner-GI/blob/master/README.md"
              target="_blank"
            >
              <CardMedia component="img" image={AdScanner} />
            </CardActionArea>
            <CardContent>
              <Box display="flex" gap={1} alignItems="center">
                <Typography variant="h5" flexGrow={1}>
                  <Trans t={t} i18nKey="as.title">
                    AdeptiScanner
                  </Trans>
                </Typography>
                <IconButton
                  href="https://github.com/D1firehail/AdeptiScanner-GI/blob/master/README.md"
                  target="_blank"
                >
                  <Download />
                </IconButton>
              </Box>

              <Typography
                variant="subtitle2"
                sx={{ display: 'flex', gap: 1, py: 1, flexWrap: 'wrap' }}
              >
                <SqBadge sx={{ display: 'flex', alignItems: 'center' }}>
                  <Computer sx={{ pr: 0.5 }} />
                  {t('tags.pc') as string}
                </SqBadge>
                <SqBadge sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonSearch sx={{ pr: 0.5 }} />
                  {t('tags.characters') as string}
                </SqBadge>
                <SqBadge
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <AnvilIcon />
                  {t('tags.weapons') as string}
                </SqBadge>
                <Tooltip
                  placement="top"
                  title={<Typography>{t('addlArtiText')}</Typography>}
                >
                  <SqBadge sx={{ display: 'flex', alignItems: 'center' }}>
                    <FlowerIcon sx={{ pr: 0.5 }} />
                    {t('tags.addlArti') as string}
                  </SqBadge>
                </Tooltip>
                <WarningWrapper>
                  <SqBadge
                    color="warning"
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <Warning sx={{ pr: 0.5 }} />
                    {t('tags.gameMani') as string}
                  </SqBadge>
                </WarningWrapper>
              </Typography>
              <Typography gutterBottom>
                <Trans t={t} i18nKey="as.p1">
                  Scans all artifacts and weapons in your inventory. Has a
                  manual scanning mode and can also import via
                  <Link
                    href="https://enka.network/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Enka.Network
                  </Link>
                  .
                </Trans>
              </Typography>
              <Typography gutterBottom>
                <Trans t={t} i18nKey="goodeng">
                  This app only scans in English and exports to
                  <code>GOOD</code>
                  format.
                </Trans>
              </Typography>
            </CardContent>
          </CardThemed>
        </Grid>
        <Grid item xs={1}>
          <CardThemed sx={{ height: '100%' }}>
            <CardActionArea
              href="https://konkers.github.io/irminsul/02-quickstart.html"
              target="_blank"
            >
              <CardMedia component="img" image={Irminsul} />
            </CardActionArea>
            <CardContent>
              <Box display="flex" gap={1} alignItems="center">
                <Typography variant="h5" flexGrow={1}>
                  <Trans t={t} i18nKey="is.title">
                    Irminsul
                  </Trans>
                </Typography>
                <IconButton
                  href="https://discord.gg/aQqdZPHEpP"
                  target="_blank"
                >
                  <DiscordIcon />
                </IconButton>
                <IconButton
                  href="https://konkers.github.io/irminsul/02-quickstart.html"
                  target="_blank"
                >
                  <Download />
                </IconButton>
              </Box>

              <Typography
                variant="subtitle2"
                sx={{ display: 'flex', gap: 1, py: 1, flexWrap: 'wrap' }}
              >
                <SqBadge sx={{ display: 'flex', alignItems: 'center' }}>
                  <Computer sx={{ pr: 0.5 }} />
                  {t('tags.pc') as string}
                </SqBadge>
                <SqBadge sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonSearch sx={{ pr: 0.5 }} />
                  {t('tags.characters') as string}
                </SqBadge>
                <SqBadge
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <AnvilIcon />
                  {t('tags.weapons') as string}
                </SqBadge>
                <SqBadge sx={{ display: 'flex', alignItems: 'center' }}>
                  <Backpack sx={{ pr: 0.5 }} />
                  {t('tags.materials') as string}
                </SqBadge>
                <SqBadge sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmojiEvents sx={{ pr: 0.5 }} />
                  {t('tags.achievements') as string}
                </SqBadge>
                <Tooltip
                  placement="top"
                  title={<Typography>{t('addlArtiText')}</Typography>}
                >
                  <SqBadge sx={{ display: 'flex', alignItems: 'center' }}>
                    <FlowerIcon sx={{ pr: 0.5 }} />
                    {t('tags.addlArti') as string}
                  </SqBadge>
                </Tooltip>
                <WarningWrapper strong>
                  <SqBadge
                    color="warning"
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <Warning sx={{ pr: 0.5 }} />
                    {t('tags.gameMani') as string}
                  </SqBadge>
                </WarningWrapper>
              </Typography>
              <Typography gutterBottom>
                <Trans t={t} i18nKey="is.p1"></Trans>
              </Typography>
              <Typography gutterBottom>
                <Trans t={t} i18nKey="seelieme">
                  This app can also scan materials for
                  <Link
                    href="https://seelie.me/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Seelie.me
                  </Link>
                </Trans>
              </Typography>
              <Typography gutterBottom>
                <Trans t={t} i18nKey="is.p2">
                  This app is also able to scan achievements for
                  <Link
                    href="https://paimon.moe"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Paimon.moe
                  </Link>
                  and
                  <Link
                    href="https://seelie.me/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Seelie.me
                  </Link>
                  .
                </Trans>
              </Typography>
              <Typography gutterBottom>
                <Trans t={t} i18nKey="good">
                  This app exports to
                  <code>GOOD</code>
                  format.
                </Trans>
              </Typography>
            </CardContent>
          </CardThemed>
        </Grid>
      </Grid>
    </Box>
  )
}

function WarningWrapper({
  children,
  strong = false,
}: { children: JSX.Element; strong?: boolean }) {
  const { t } = useTranslation('page_scanner')
  return (
    <Tooltip
      placement="top"
      title={
        <Typography>
          <Trans t={t} i18nKey={strong ? 'tosStrongWarn' : 'tosWarn'}>
            As any tools that indirectly interact with the game, although their
            usage is virtually undetectable,
            <Link
              color="inherit"
              href="https://genshin.mihoyo.com/en/news/detail/5763"
              target="_blank"
              rel="noreferrer"
            >
              there could still be risk with using them.
            </Link>
            Users discretion is advised.
          </Trans>
        </Typography>
      }
    >
      {children}
    </Tooltip>
  )
}

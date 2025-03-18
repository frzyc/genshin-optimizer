import { CardThemed } from '@genshin-optimizer/common/ui'
import { ZCard } from '@genshin-optimizer/zzz/ui'
import GroupsIcon from '@mui/icons-material/Groups'
import {
  Box,
  CardContent,
  CardHeader,
  Grid,
  Link,
  Typography,
} from '@mui/material'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import failchon from './teamIcons/failchon.png'
import frzyc from './teamIcons/frzyc.png'
import lantua from './teamIcons/lantua.png'
import lunik from './teamIcons/lunik.png'
import van from './teamIcons/van.webp'
const team = [
  {
    name: 'frzyc',
    img: frzyc,
    title: (t: TFunction) => t('teamCard.jobTitle.leadDev'),
    subtitle: 'Chief Corner Cutter',
    url: process.env.NX_URL_GITHUB_FRZYC,
  },
  {
    name: 'Van',
    img: van,
    title: (t: TFunction) => t('teamCard.jobTitle.dev'),
    subtitle: 'Pando Cultivator',
    url: process.env.NX_URL_GITHUB_VAN,
  },
  {
    name: 'Lantua',
    img: lantua,
    title: (t: TFunction) => t('teamCard.jobTitle.dev'),
    subtitle: 'Pando Arboreal Architect',
    url: process.env.NX_URL_GITHUB_LANTUA,
  },
  {
    name: 'Failchon',
    img: failchon,
    title: (t: TFunction) => t('teamCard.jobTitle.dev'),
    subtitle: 'TODO Deletist',
    url: '',
  },
  {
    name: 'Lunik',
    img: lunik,
    title: (t: TFunction) => t('teamCard.jobTitle.designer'),
    subtitle: 'Figma Finger Painter',
    url: '',
  },
] as const

export default function TeamCard() {
  const { t } = useTranslation(['page_home', 'ui'])
  return (
    <ZCard>
      <CardHeader
        title={<Typography variant="h5">{t('teamCard.title')}</Typography>}
        avatar={<GroupsIcon fontSize="large" />}
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Grid container spacing={1}>
          {team.map(({ name, img, title, subtitle, url = '' }) => (
            <Grid item key={name} xs={6} md={4}>
              <CardThemed bgt="light" sx={{ height: '100%' }}>
                <CardContent>
                  <Box
                    component="img"
                    src={img}
                    sx={{ width: '100%', height: 'auto', borderRadius: '50%' }}
                  />
                  <Box display="flex" flexDirection="column">
                    {url ? (
                      <Typography
                        variant="h6"
                        sx={{ textAlign: 'center' }}
                        color="inherit"
                        component={Link}
                        href={url}
                        target="_blank"
                        rel="noopener"
                      >
                        <strong>{name}</strong>
                      </Typography>
                    ) : (
                      <Typography variant="h6" sx={{ textAlign: 'center' }}>
                        <strong>{name}</strong>
                      </Typography>
                    )}
                    <Typography
                      variant="subtitle1"
                      sx={{ textAlign: 'center' }}
                    >
                      {title(t)}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        textAlign: 'center',
                      }}
                      color="secondary.light"
                    >
                      {subtitle}
                    </Typography>
                  </Box>
                </CardContent>
              </CardThemed>
            </Grid>
          ))}
        </Grid>
        <CardThemed bgt="light">
          <CardContent>
            <Typography>
              Thanks to{' '}
              <Link
                href="https://zzz.hakush.in/"
                target="_blank"
                rel="noreferrer"
              >
                hakushin.in
              </Link>{' '}
              for providing the API data.
            </Typography>
            <Typography>
              Thanks to{' '}
              <Link
                href="https://enka.network/?zzz"
                target="_blank"
                rel="noreferrer"
              >
                enka.network
              </Link>{' '}
              for supplying the SVGs for stats.
            </Typography>
            <Typography>
              A huge thank you to our community for using Zenless Optimizer and
              supporting the project!
            </Typography>
          </CardContent>
        </CardThemed>
      </CardContent>
    </ZCard>
  )
}

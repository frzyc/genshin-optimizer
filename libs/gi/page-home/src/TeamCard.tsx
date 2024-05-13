import { CardThemed } from '@genshin-optimizer/common/ui'
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Link,
  Typography,
} from '@mui/material'
import d1 from './teamIcons/d1.png'
import frzyc from './teamIcons/frzyc.png'
import lantua from './teamIcons/lantua.png'
import polomo from './teamIcons/polomo.png'
import qbe from './teamIcons/qbe.png'
import sin from './teamIcons/sin.png'
import stain from './teamIcons/stain.png'
import toofless from './teamIcons/toofless.png'
import van from './teamIcons/van.webp'
import vlad from './teamIcons/vlad.jpg'
import yae from './teamIcons/yae.png'

import GroupsIcon from '@mui/icons-material/Groups'
import { useTranslation } from 'react-i18next'
const team = [
  {
    name: 'frzyc',
    img: frzyc,
    title: (t) => t`teamCard.jobTitle.leadDev`,
    subtitle: 'Insomniac in Chief',
    url: process.env.NX_URL_GITHUB_FRZYC,
  },
  {
    name: 'Lantua',
    img: lantua,
    title: (t) => t`teamCard.jobTitle.dev`,
    subtitle: 'Copium Calculator',
    url: process.env.NX_URL_GITHUB_LANTUA,
  },
  {
    name: 'Van',
    img: van,
    title: (t) => t`teamCard.jobTitle.dev`,
    subtitle: 'Waverider Stowaway',
    url: process.env.NX_URL_GITHUB_VAN,
  },
  {
    name: '✦ Sin ✦',
    img: sin,
    title: (t) => t`teamCard.jobTitle.admin`,
    subtitle: 'Ohh, shiny.',
    url: '',
  },
  {
    name: 'Stain',
    img: stain,
    title: (t) => t`teamCard.jobTitle.admin`,
    subtitle: 'Australia Man',
    url: '',
  },
  {
    name: 'yae!',
    img: yae,
    title: (t) => t`teamCard.jobTitle.dev`,
    subtitle: 'eeeqeee',
    url: '',
  },
  {
    name: 'tooflesswulf',
    img: toofless,
    title: (t) => t`teamCard.jobTitle.dev`,
    subtitle: 'Mad Mathematician',
    url: '',
  },
  {
    name: 'Qbe',
    img: qbe,
    title: (t) => t`teamCard.jobTitle.dev`,
    subtitle: 'Irminsul Debugger',
    url: '',
  },
  {
    name: 'Polomo',
    img: polomo,
    title: (t) => t`teamCard.jobTitle.translator`,
    subtitle: 'Director of Text',
    url: '',
  },
  {
    name: 'Vlad',
    img: vlad,
    title: (t) => t`teamCard.jobTitle.TC`,
    subtitle: 'Spreadsheet Renegade',
    url: '',
  },
  {
    name: 'D1firehail',
    img: d1,
    title: (t) => t`teamCard.jobTitle.mod`,
    subtitle: 'Scanner Spy',
    url: '',
  },
] as const

export default function TeamCard() {
  const { t } = useTranslation(['page_home', 'ui'])
  return (
    <CardThemed>
      <CardHeader
        title={<Typography variant="h5">{t`teamCard.title`}</Typography>}
        avatar={<GroupsIcon fontSize="large" />}
      />
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Grid container columns={{ xs: 6, md: 12 }} spacing={1}>
          {team.map(({ name, img, title, subtitle, url }, i) => (
            <Grid item key={name} xs={i < 2 ? 3 : 2} md={i <= 2 ? 4 : 3}>
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
                        transform:
                          name === 'Stain' ? 'rotate(180deg)' : undefined,
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
      </CardContent>
    </CardThemed>
  )
}

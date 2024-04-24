import { CardThemed } from '@genshin-optimizer/common/ui'
import '@genshin-optimizer/gi/i18n'
import { theme } from '@genshin-optimizer/gi/theme'
import { DynamicFeed, Refresh } from '@mui/icons-material'
import {
  Box,
  Button,
  CardActions,
  CardContent,
  CssBaseline,
  Divider,
  StyledEngineProvider,
  ThemeProvider,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import derp from './derp.jpeg'

export default function NewTab() {
  const { t } = useTranslation('page_newTab')
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <Box
          display="flex"
          minWidth="100vw"
          minHeight="100vh"
          justifyContent="center"
          alignItems="center"
        >
          <CardThemed bgt="light">
            <Box display="flex" flexDirection="column">
              <CardContent
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h6">{t`title`}</Typography>
                <DynamicFeed />
              </CardContent>
              <Divider />
              <Box display="flex">
                <CardContent sx={{ flexGrow: 1, maxWidth: 600 }}>
                  <Typography>{t`p1`}</Typography>
                  <ul>
                    <li>{t`symptom.1`}</li>
                    <li>{t`symptom.2`}</li>
                    <li>{t`symptom.3`}</li>
                    <li>{t`symptom.4`}</li>
                  </ul>
                  <Typography>{t`p2`}</Typography>
                  <ul>
                    <li>{t`choice.1`}</li>
                    <li>{t`choice.2`}</li>
                  </ul>
                </CardContent>
                <Box
                  component="img"
                  src={derp}
                  maxWidth={400}
                  maxHeight={400}
                />
              </Box>
              <Divider />
              <CardActions>
                <Button
                  startIcon={<Refresh />}
                  onClick={() => document.location.reload()}
                >{t`refresh`}</Button>
              </CardActions>
            </Box>
          </CardThemed>
        </Box>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

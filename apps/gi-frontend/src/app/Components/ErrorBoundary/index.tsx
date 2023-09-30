import { ThemeProvider } from '@emotion/react'
import { ReadOnlyTextArea } from '@genshin-optimizer/react-util'
import { CardThemed } from '@genshin-optimizer/ui-common'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ErrorIcon from '@mui/icons-material/Error'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  Box,
  Button,
  CardActions,
  CardContent,
  CssBaseline,
  Divider,
  Stack,
  StyledEngineProvider,
  Typography,
} from '@mui/material'
import type { ErrorInfo, ReactNode } from 'react'
import { Component, Suspense } from 'react'
import type { WithTranslation } from 'react-i18next'
import { Trans, withTranslation } from 'react-i18next'
import { theme } from '../../Theme'
// import DatabaseCard from '../PageSettings/DatabaseCard'
import SpaghettiCode from './SpaghettiCode.png'

interface Props extends WithTranslation {
  children?: ReactNode
}

interface State {
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public override state: State = {}

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { error }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public override render() {
    if (this.state.error) {
      document.title = 'ERROR'
      const t = this.props.t
      const reproStr =
        'Please enter the steps to reproduce this error below:\n1. '
      const errorStr = `Message: ${this.state.error.message}\nName: ${this.state.error.name}\nStack: ${this.state.error.stack}`
      const uploadStr = "**Don't forget to upload your JSON file!**"
      const textBoxVal = `${reproStr}\n\n${uploadStr}\n\n\`\`\`\n${errorStr}\n\`\`\``
      const onNuke = () => {
        if (!window.confirm(t`confirmNuke`)) return
        localStorage.clear()
        window.alert(t`finishNuke`)
        document.location.reload()
      }

      return (
        <Suspense>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Box
                display="flex"
                minWidth="100vw"
                minHeight="100vh"
                justifyContent="center"
                alignItems="center"
                p={2}
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
                      <ErrorIcon color="error" />
                    </CardContent>
                    <Divider />
                    <Box display="flex">
                      <CardContent sx={{ flexGrow: 1, maxWidth: 600 }}>
                        <Typography>{t`p1.1`}</Typography>
                        <Typography>{t`p1.2`}</Typography>
                        <ul>
                          <Typography>
                            <li>{t`fixes.1`}</li>
                          </Typography>
                          <Typography>
                            <li>{t`fixes.2`}</li>
                          </Typography>
                          <Typography>
                            <li>{t`fixes.3`}</li>
                          </Typography>
                        </ul>
                        <Typography>{t`p2`}</Typography>
                        <ul>
                          <Typography>
                            <li>{t`report.1`}</li>
                          </Typography>
                          <Typography>
                            <li>{t`report.2`}</li>
                          </Typography>
                          <Typography>
                            <li>
                              <Trans t={t} i18nKey="report.3">
                                Click{' '}
                                <a
                                  href={`${
                                    import.meta.env['NX_URL_GITHUB_GO']
                                  }/issues/new?title=Unexpected%20Crash%Occurred`}
                                  style={{ color: 'white' }}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  here
                                </a>{' '}
                                to report on GitHub. Paste the text in the
                                description, and include your JSON files (you
                                might need to rename them to end with '.txt')
                              </Trans>
                            </li>
                          </Typography>
                          <Typography>
                            <li>
                              <Trans t={t} i18nKey="report.4">
                                Or click{' '}
                                <a
                                  href={import.meta.env['NX_URL_DISCORD_GO']}
                                  style={{ color: 'white' }}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  here
                                </a>{' '}
                                to report on Discord. Open the #🐛bug-reports
                                channel, create a new thread and paste the text
                                in the message box. Also upload your JSON files.
                              </Trans>
                            </li>
                          </Typography>
                        </ul>
                      </CardContent>
                      <Stack p={1}>
                        <Box
                          component="img"
                          src={SpaghettiCode}
                          maxWidth={400}
                        />
                        <Typography fontStyle="italic">{t`caption`}</Typography>
                      </Stack>
                    </Box>
                    <CardContent sx={{ gap: 2, p: 0 }}>
                      <Box p={2}>
                        <ReadOnlyTextArea value={textBoxVal} />
                      </Box>
                      {/* <DatabaseCard readOnly /> */}
                    </CardContent>
                    <Divider />
                    <CardActions
                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      <Button
                        startIcon={<RefreshIcon />}
                        onClick={() => document.location.reload()}
                      >{t`refresh`}</Button>
                      <Button
                        color="error"
                        startIcon={<DeleteForeverIcon />}
                        onClick={onNuke}
                      >{t`nuke`}</Button>
                    </CardActions>
                  </Box>
                </CardThemed>
              </Box>
            </ThemeProvider>
          </StyledEngineProvider>
        </Suspense>
      )
    }

    return this.props.children
  }
}

export default withTranslation('page_error')(ErrorBoundary)

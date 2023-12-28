import { Box, Container, Stack } from '@mui/material'
import { dir } from 'i18next'
import * as React from 'react'
import DataWrapper from './components/DataWrapper'
import Footer from './components/Footer'
import Header from './components/Header'
import ApolloProviderWrapper from './layoutWrappers/ApolloProviderWrapper'
import { SessionProviderWrapper } from './layoutWrappers/SessionProviderWrapper'
import ThemeRegistry from './layoutWrappers/ThemeRegistry/ThemeRegistry'
import TransClientUpdate from './layoutWrappers/TransClientUpdate'
import { auth } from '../../auth'
import { languages } from '../../i18n/settings'

export const metadata = {
  title: 'Genshin Optimizer',
  description:
    'The Ultimate Genshin Impact calculator, that allows you to min-max your characters according to how you play, using what you have.',
}

export async function generateStaticParams() {
  return languages.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const authSession = await auth() //load the session from the server side
  return (
    <html lang={locale} dir={dir(locale)}>
      <body>
        <SessionProviderWrapper session={authSession}>
          <ApolloProviderWrapper>
            <ThemeRegistry>
              <TransClientUpdate locale={locale} />
              <DataWrapper>
                <Stack minHeight="100vh">
                  <Header locale={locale} />
                  <Container
                    maxWidth="xl"
                    sx={{
                      px: { xs: 0.5, sm: 1, md: 2 },
                      py: { xs: 0.5, sm: 1, md: 2 },
                    }}
                  >
                    {children}
                  </Container>
                  {/* make sure footer is always at bottom */}
                  <Box flexGrow={1} />
                  <Footer />
                </Stack>
              </DataWrapper>
            </ThemeRegistry>
          </ApolloProviderWrapper>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}

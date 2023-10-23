import * as React from 'react'
import { auth } from '../../auth'
import ApolloProviderWrapper from '../../components/ApolloProviderWrapper'
import { SessionProviderWrapper } from '../../components/SessionProviderWrapper'
import ThemeRegistry from '../../components/ThemeRegistry/ThemeRegistry'
import Content from './components/Content'
import { languages } from '../../i18n/settings'
import { dir } from 'i18next'
import TransClientUpdate from '../../components/TransClientUpdate'

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
              <Content>{children}</Content>
            </ThemeRegistry>
          </ApolloProviderWrapper>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}

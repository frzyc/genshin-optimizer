import * as React from 'react'
import { auth } from '../auth'
import ApolloProviderWrapper from '../components/ApolloProviderWrapper'
import { SessionProviderWrapper } from '../components/SessionProviderWrapper'
import ThemeRegistry from '../components/ThemeRegistry/ThemeRegistry'
import Content from './components/Content'

export const metadata = {
  title: 'Genshin Optimizer',
  description:
    'The Ultimate Genshin Impact calculator, that allows you to min-max your characters according to how you play, using what you have.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authSession = await auth() //load the session from the server side
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper session={authSession}>
          <ApolloProviderWrapper>
            <ThemeRegistry>
              <Content>{children}</Content>
            </ThemeRegistry>
          </ApolloProviderWrapper>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}

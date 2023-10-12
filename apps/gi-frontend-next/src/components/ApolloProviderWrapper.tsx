'use client'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'

import type { ReactNode } from 'react'

const client = new ApolloClient({
  uri: 'http://localhost:4200/graphql', // TODO: .env
  cache: new InMemoryCache(),
})

export default function ApolloProviderWrapper({
  children,
}: {
  children: ReactNode
}) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

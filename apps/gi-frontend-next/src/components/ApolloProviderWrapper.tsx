'use client'
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client'

import type { ReactNode } from 'react'
const httpLink = new HttpLink({
  uri: 'http://localhost:4200/graphql', // TODO: .env
  credentials: 'include', // use "same-origin" if backend has the same origin
})
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})

export default function ApolloProviderWrapper({
  children,
}: {
  children: ReactNode
}) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

'use client'
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { useSession } from 'next-auth/react'

import { useMemo, type ReactNode } from 'react'

/**
 * This needs to be within the `SessionProviderWrapper` because it sends the JWT in the header of the request for authentication.
 * @param param0
 * @returns
 */
export default function ApolloProviderWrapper({
  children,
}: {
  children: ReactNode
}) {
  const { data: session } = useSession()
  const token = session?.auth_token
  const client = useMemo(() => {
    const authLink = setContext((_, { headers }) => {
      // return the headers to the context so httpLink can read them
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        },
      }
    }).concat(
      createHttpLink({
        uri: process.env['NEXT_PUBLIC_GRAPHQL_ENDPOINT'] ?? '',
      })
    )

    const client = new ApolloClient({
      link: authLink,
      cache: new InMemoryCache(),
    })
    client.resetStore() // reset store when the auth token changes.
    return client
  }, [token])
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

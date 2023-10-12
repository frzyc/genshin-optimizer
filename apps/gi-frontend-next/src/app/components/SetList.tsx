'use client'
import { useSetListQuery } from '@genshin-optimizer/gi-frontend-gql'

export function SetList() {
  const { loading, error, data } = useSetListQuery()
  console.log({ loading, error, data })
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error :(</p>

  return (
    <>
      <h1>My Lego Sets</h1>
      <ul>
        {data?.allSets?.map((set) => {
          if (!set) return null
          const { id, name, numParts, year } = set
          return (
            <li key={id}>
              {year} - <strong>{name}</strong> ({numParts} parts)
            </li>
          )
        })}
      </ul>
    </>
  )
}

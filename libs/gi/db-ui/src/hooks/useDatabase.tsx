import { useContext } from 'react'
import { DatabaseContext } from '../contexts'

export function useDatabase() {
  const { database } = useContext(DatabaseContext)
  return database
}

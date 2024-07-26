import { createContext } from 'react'
import type { Team } from './getTeam'

export const TeamContext = createContext<Team | null>(null)

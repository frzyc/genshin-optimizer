import { createContext } from 'react'

/** Sticky character-select bar on the Pando optimize page. */
export const TEAM_HEADER_HEIGHT_PX = 74
/** Vertical gap between stacked sticky section title bars. */
export const SECTION_SPACING_PX = 33
/** Extra offset so stats stick below the character section title. */
export const STATS_STICKY_PAD_PX = 8

export const TeamHeaderHeightContext = createContext(TEAM_HEADER_HEIGHT_PX)

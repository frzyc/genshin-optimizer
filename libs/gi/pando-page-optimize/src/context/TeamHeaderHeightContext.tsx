import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

/** Sticky optimize chrome (context bar) approximate height. */
/** Context row + mobile section tabs inside sticky chrome. */
export const TEAM_HEADER_HEIGHT_PX = 88
/** Mobile sticky chrome when the context trigger row is collapsed. */
export const MOBILE_STICKY_CHROME_TABS_ONLY_PX = 48
/** gi-frontend mobile AppBar + toolbar spacer (MUI default). */
export const MOBILE_APP_BAR_OFFSET_PX = 56
/** Vertical gap between stacked sticky section title bars. */
export const SECTION_SPACING_PX = 33
/** Extra offset so stats stick below the character section title. */
export const STATS_STICKY_PAD_PX = 8

export const TeamHeaderHeightContext = createContext(TEAM_HEADER_HEIGHT_PX)

const TeamHeaderHeightSetterContext = createContext<
  ((height: number) => void) | null
>(null)

export function TeamHeaderHeightProvider({
  children,
}: {
  children: ReactNode
}) {
  const [height, setHeight] = useState(TEAM_HEADER_HEIGHT_PX)
  const value = useMemo(() => height, [height])
  return (
    <TeamHeaderHeightContext.Provider value={value}>
      <TeamHeaderHeightSetterContext.Provider value={setHeight}>
        {children}
      </TeamHeaderHeightSetterContext.Provider>
    </TeamHeaderHeightContext.Provider>
  )
}

/** Keeps section scroll margins / nested sticky tops in sync with optimize chrome. */
export function useReportTeamHeaderHeight(heightPx: number) {
  const setHeight = useContext(TeamHeaderHeightSetterContext)
  useEffect(() => {
    setHeight?.(heightPx)
  }, [heightPx, setHeight])
}

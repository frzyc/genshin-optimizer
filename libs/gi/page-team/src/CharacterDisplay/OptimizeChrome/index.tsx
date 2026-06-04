import { useBoolState } from '@genshin-optimizer/common/react-util'
import { TeamCharacterContext } from '@genshin-optimizer/gi/db-ui'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import type { OptimizeFlowKind } from '@genshin-optimizer/gi/ui'
import { Box, Skeleton } from '@mui/material'
import { Suspense, useCallback, useContext } from 'react'
import { LoadoutSubTabs } from '../LoadoutSubTabs'
import CharacterOptimizePanel from '../Tabs/TabOptimize/CharacterOptimizePanel'
import TabOverview from '../Tabs/TabOverview'
import TabTalent from '../Tabs/TabTalent'
import TabTheorycraft from '../Tabs/TabTheorycraft'
import TabUpopt from '../Tabs/TabUpgradeOpt'
import { CompactTeamRow } from './CompactTeamRow'
import { OptimizeCalcBar } from './OptimizeCalcBar'
import { OptimizeCalcBarProvider } from './OptimizeCalcBarContext'
import { OptimizeContextBar } from './OptimizeContextBar'

export default function OptimizeChrome({
  flow = 'experiment',
  tab: tabProp,
}: {
  flow?: OptimizeFlowKind
  tab?: string
}) {
  const {
    loadoutDatum,
    teamChar: { key: characterKey },
  } = useContext(TeamCharacterContext)
  const isTCBuild = !!(
    loadoutDatum.buildTcId && loadoutDatum.buildType === 'tc'
  )
  const elementKey = getCharEle(characterKey)
  const tab = tabProp ?? 'overview'

  const [teamBuffsOpen, onOpenTeamBuffs, onCloseTeamBuffs] = useBoolState()
  const toggleTeamBuffs = useCallback(() => {
    if (teamBuffsOpen) onCloseTeamBuffs()
    else onOpenTeamBuffs()
  }, [teamBuffsOpen, onOpenTeamBuffs, onCloseTeamBuffs])

  return (
    <OptimizeCalcBarProvider>
      <Box display="flex" flexDirection="column" gap={1}>
        <OptimizeContextBar flow={flow} />
        <CompactTeamRow
          flow={flow}
          teamBuffsOpen={teamBuffsOpen}
          onToggleTeamBuffs={toggleTeamBuffs}
        />
        <OptimizeCalcBar showTarget={!isTCBuild} />
        <LoadoutSubTabs
          flow={flow}
          tab={tab}
          elementKey={elementKey}
          isTCBuild={isTCBuild}
          compact
        />
        <Suspense
          fallback={
            <Skeleton variant="rectangular" width="100%" height={500} />
          }
        >
          {isTCBuild ? (
            <TabTheorycraft />
          ) : tab === 'optimize' ? (
            <CharacterOptimizePanel />
          ) : tab === 'talent' ? (
            <TabTalent />
          ) : tab === 'upopt' ? (
            <TabUpopt />
          ) : (
            <TabOverview />
          )}
        </Suspense>
      </Box>
    </OptimizeCalcBarProvider>
  )
}

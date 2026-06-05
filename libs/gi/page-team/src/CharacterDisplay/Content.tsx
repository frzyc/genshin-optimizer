import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { TeamCharacterContext } from '@genshin-optimizer/gi/db-ui'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import { Skeleton } from '@mui/material'
import { Suspense, useCallback, useContext } from 'react'
import { CharacterBannerCard } from './CharacterBannerCard'
import FormulaModal from './FormulaModal'
import { LoadoutHeader } from './LoadoutHeader'
import { LoadoutSubTabs } from './LoadoutSubTabs'
import TabOptimize from './Tabs/TabOptimize'
import TabOverview from './Tabs/TabOverview'
import TabTalent from './Tabs/TabTalent'
import TabTheorycraft from './Tabs/TabTheorycraft'
import TabUpopt from './Tabs/TabUpgradeOpt'

export default function Content({ tab }: { tab?: string }) {
  const {
    loadoutDatum,
    teamChar: { key: characterKey },
  } = useContext(TeamCharacterContext)
  const isTCBuild = !!(
    loadoutDatum.buildTcId && loadoutDatum.buildType === 'tc'
  )
  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <>
      <FormulaModal />
      <TabNav
        tab={tab}
        characterKey={characterKey}
        isTCBuild={isTCBuild}
        onChange={() => {}}
      />
      <CharacterPanel isTCBuild={isTCBuild} tab={tab} />
      <TabNav
        tab={tab}
        characterKey={characterKey}
        isTCBuild={isTCBuild}
        hideTitle
        onChange={scrollTop}
      />
    </>
  )
}

function CharacterPanel({
  isTCBuild,
  tab,
}: {
  isTCBuild: boolean
  tab?: string
}) {
  const activeTab = tab || 'overview'
  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" width="100%" height={500} />}
    >
      {isTCBuild ? (
        <TabTheorycraft />
      ) : activeTab === 'optimize' ? (
        <TabOptimize />
      ) : activeTab === 'talent' ? (
        <TabTalent />
      ) : activeTab === 'upopt' ? (
        <TabUpopt />
      ) : (
        <TabOverview />
      )}
    </Suspense>
  )
}

function TabNav({
  tab,
  characterKey,
  isTCBuild,
  hideTitle = false,
  onChange,
}: {
  tab?: string
  characterKey: CharacterKey
  isTCBuild: boolean
  hideTitle?: boolean
  onChange?: () => void
}) {
  const elementKey = getCharEle(characterKey)

  return (
    <CharacterBannerCard characterKey={characterKey} elementKey={elementKey}>
      {!hideTitle && <LoadoutHeader elementKey={elementKey} />}
      <LoadoutSubTabs
        tab={tab}
        isTCBuild={isTCBuild}
        elementKey={elementKey}
        flow="teams"
        onChange={onChange}
      />
    </CharacterBannerCard>
  )
}

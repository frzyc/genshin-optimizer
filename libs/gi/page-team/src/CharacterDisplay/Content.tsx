import { CardThemed } from '@genshin-optimizer/common/ui'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { TeamCharacterContext, useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import { Skeleton } from '@mui/material'
import { Suspense, useCallback, useContext } from 'react'
import FormulaModal from './FormulaModal'
import { LoadoutHeader } from './LoadoutHeader'
import { LoadoutSubTabs } from './LoadoutSubTabs'
import TabOverview from './Tabs/TabOverview'
import TabTalent from './Tabs/TabTalent'
import TabTheorycraft from './Tabs/TabTheorycraft'
import TabUpopt from './Tabs/TabUpgradeOpt'
import TabOptimize from './Tabs/TabOptimize'

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
  const { gender } = useDBMeta()
  const elementKey = getCharEle(characterKey)
  const banner = characterAsset(characterKey, 'banner', gender)

  return (
    <CardThemed
      sx={(theme) => {
        return {
          position: 'relative',
          boxShadow: elementKey
            ? `0px 0px 0px 1px ${theme.palette[elementKey].main} inset`
            : undefined,
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.3,
            backgroundImage: `url(${banner})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          },
        }
      }}
    >
      {!hideTitle && <LoadoutHeader elementKey={elementKey} />}
      <LoadoutSubTabs
        tab={tab}
        isTCBuild={isTCBuild}
        elementKey={elementKey}
        flow="teams"
        onChange={onChange}
      />
    </CardThemed>
  )
}

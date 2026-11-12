import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import { DebugListingsDisplay } from '@genshin-optimizer/game-opt/formula-ui'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { getMainCharacterOptConfigId } from '@genshin-optimizer/zzz/db'
import {
  OptConfigProvider,
  useCharacterContext,
  useDiscSets,
  useDiscs,
  useTeam,
  useWengine,
} from '@genshin-optimizer/zzz/db-ui'
import { own } from '@genshin-optimizer/zzz/formula'
import {
  CharacterEditor,
  CharStatsDisplay,
  DiscSheetDisplay,
  WengineSheetDisplay,
} from '@genshin-optimizer/zzz/formula-ui'
import { CharacterCard, StatHighlightContext } from '@genshin-optimizer/zzz/ui'
import { Box, Grid, Stack, useMediaQuery, useTheme } from '@mui/material'
import { useCallback, useContext, useMemo, useState } from 'react'
import { AnomalySection } from './Anomaly'
import { BonusStatsSection } from './BonusStats'
import { CharSheetSection } from './CharSheetsDisplay'
import { useOptimizePage } from './context/OptimizePageContext'
import {
  STATS_STICKY_PAD_PX,
  TeamHeaderHeightContext,
} from './context/TeamHeaderHeightContext'
import { EnemyStatsSection } from './EnemyStats'
import {
  OPT_SECTION_IDS,
  optimizeSectionOrder,
  showsCharSheetSection,
} from './nav/optimizeSections'
import { SectionAnchor } from './nav/SectionAnchor'
import { DesktopSectionRail } from './nav/SectionRail'
import Optimize from './Optimize'
import { EquippedGrid } from './Optimize/EquippedGrid'
import GeneratedBuildsDisplay from './Optimize/GeneratedBuildsDisplay'
import {
  MobileOptimizeBar,
  MobileOptimizeBarSpacer,
} from './Optimize/MobileOptimizeBar'
import { OptTargetHero } from './OptTargetHero'
import { OptTargetRow } from './OptTargetRow'
import { TeammatesSection } from './Teammates'

export function CharacterOptDisplay() {
  const character = useCharacterContext()!
  const sections = optimizeSectionOrder(character.key)
  const { editorKey, closeBuildEditor } = useOptimizePage()

  return (
    <Stack gap={1} sx={{ pb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
        <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
          <CharacterOverview />
          <SectionAnchor sectionId={OPT_SECTION_IDS.opt}>
            <Optimize />
          </SectionAnchor>
          <SectionAnchor sectionId={OPT_SECTION_IDS.builds}>
            <BuildsSection />
          </SectionAnchor>
        </Stack>
        <DesktopSectionRail sections={sections} />
      </Box>
      <MobileOptimizeBar />
      <MobileOptimizeBarSpacer />
      <CharacterEditor characterKey={editorKey} onClose={closeBuildEditor} />
    </Stack>
  )
}

function CharacterOverview() {
  const character = useCharacterContext()!
  const { key: characterKey } = character
  const headerHeight = useContext(TeamHeaderHeightContext)
  const { openBuildEditor } = useOptimizePage()
  const onClick = useCallback(() => {
    openBuildEditor(characterKey)
  }, [characterKey, openBuildEditor])
  const theme = useTheme()
  const isNotXs = useMediaQuery(theme.breakpoints.up('sm'))
  const [statHighlight, setStatHighlight] = useState('')
  const statHLContextObj = useMemo(
    () => ({ statHighlight, setStatHighlight }),
    [statHighlight, setStatHighlight]
  )
  const showSheet = showsCharSheetSection(characterKey)

  return (
    <StatHighlightContext.Provider value={statHLContextObj}>
      <Box sx={{ display: 'flex', gap: 1, overflow: 'visible' }}>
        <Grid
          container
          spacing={2}
          sx={{ flexWrap: 'wrap', overflow: 'visible' }}
        >
          <Grid
            item
            xs={12}
            sm={7}
            md={5}
            lg={4}
            xl={3}
            sx={{ height: isNotXs ? '100%' : undefined, overflow: 'visible' }}
          >
            <SectionAnchor sectionId={OPT_SECTION_IDS.character}>
              <Stack spacing={1} sx={isNotXs ? { height: '100%' } : undefined}>
                <CharacterCard characterKey={characterKey} onClick={onClick} />
                <Box sx={{ flexGrow: 1 }}>
                  <Box
                    sx={
                      isNotXs
                        ? {
                            position: 'sticky',
                            top: headerHeight + STATS_STICKY_PAD_PX + 44,
                            bottom: 0,
                          }
                        : undefined
                    }
                  >
                    <CharStatsDisplay />
                  </Box>
                </Box>
              </Stack>
            </SectionAnchor>
          </Grid>
          <Grid item xs={12} sm={5} md={7} lg={8} xl={9}>
            <Stack spacing={3}>
              <SectionAnchor sectionId={OPT_SECTION_IDS.optTarget}>
                <Stack spacing={1}>
                  <OptTargetHero />
                  <OptTargetRow />
                </Stack>
              </SectionAnchor>
              <SectionAnchor sectionId={OPT_SECTION_IDS.eq}>
                <EquippedGrid onClick={onClick} />
              </SectionAnchor>
              <SectionAnchor sectionId={OPT_SECTION_IDS.playstyle}>
                <EquippedConditionals />
              </SectionAnchor>
              <SectionAnchor sectionId={OPT_SECTION_IDS.bonusStats}>
                <BonusStatsSection />
              </SectionAnchor>
              <SectionAnchor sectionId={OPT_SECTION_IDS.teammates}>
                <TeammatesSection />
              </SectionAnchor>
              <SectionAnchor sectionId={OPT_SECTION_IDS.enemy}>
                <EnemyStatsSection />
              </SectionAnchor>
              <SectionAnchor sectionId={OPT_SECTION_IDS.anomaly}>
                <AnomalySection />
              </SectionAnchor>
              {showSheet && (
                <SectionAnchor sectionId={OPT_SECTION_IDS.mechanics}>
                  <CharSheetSection />
                </SectionAnchor>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
      {shouldShowDevComponents && (
        <DebugListingsDisplay
          formulasRead={own.listing.formulas}
          buffsRead={own.listing.buffs}
        />
      )}
    </StatHighlightContext.Provider>
  )
}

function BuildsSection() {
  const { key: characterKey } = useCharacterContext()!
  const team = useTeam(characterKey)!
  const optConfigId = getMainCharacterOptConfigId(team)
  if (!optConfigId) return null
  return (
    <OptConfigProvider optConfigId={optConfigId}>
      <GeneratedBuildsDisplay />
    </OptConfigProvider>
  )
}

function EquippedConditionals() {
  const { equippedDiscs, equippedWengine } = useCharacterContext()!
  const discs = useDiscs(equippedDiscs)
  const sets = useDiscSets(discs)
  const wengine = useWengine(equippedWengine)
  return (
    <Box>
      <Grid container spacing={1} columns={{ xs: 1, sm: 1, md: 2, lg: 3 }}>
        {wengine && (
          <Grid item xs={1}>
            <WengineSheetDisplay wengine={wengine} />
          </Grid>
        )}
        {Object.entries(sets).map(([setKey, count]) => (
          <Grid item key={setKey} xs={1}>
            <DiscSheetDisplay
              setKey={setKey as DiscSetKey}
              fade2={count < 2}
              fade4={count < 4}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

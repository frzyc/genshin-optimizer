import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import {
  CharacterContext,
  useArtifacts,
  useRequiredPandoTeam,
  useWeapon,
} from '@genshin-optimizer/gi/db-ui'
import {
  ArtSheetDisplay,
  CharacterCard,
  CharacterEditor,
  CharSheetDisplay,
  CharStatsDisplay,
  EquippedGrid,
  WeaponSheetDisplay,
} from '@genshin-optimizer/gi/formula-ui'
import {
  Box,
  Grid,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useCallback, useContext, useMemo } from 'react'
import { useOptimizePage } from './context/OptimizePageContext'
import {
  STATS_STICKY_PAD_PX,
  TeamHeaderHeightContext,
} from './context/TeamHeaderHeightContext'
import { OptTargetHero } from './OptTargetHero'
import { OptTargetRow } from './OptTargetRow'
import { EnemyStatsSection } from './EnemyStats'
import { SectionAnchor } from './nav/SectionAnchor'
import { OPT_SECTION_IDS } from './nav/optimizeSections'
import { DesktopSectionRail } from './nav/SectionRail'
import Optimize from './Optimize'
import GeneratedBuildsDisplay from './Optimize/GeneratedBuildsDisplay'
import {
  MobileOptimizeBar,
  MobileOptimizeBarSpacer,
} from './Optimize/MobileOptimizeBar'
import { TeammatesSection } from './Teammates'

export function CharacterOptDisplay() {
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
            <GeneratedBuildsDisplay />
          </SectionAnchor>
        </Stack>
        <DesktopSectionRail />
      </Box>
      <MobileOptimizeBar />
      <MobileOptimizeBarSpacer />
      <CharacterEditor characterKey={editorKey} onClose={closeBuildEditor} />
    </Stack>
  )
}

function CharacterOverview() {
  const { character } = useContext(CharacterContext)
  const { key: characterKey } = character
  const pandoTeam = useRequiredPandoTeam()
  const headerHeight = useContext(TeamHeaderHeightContext)
  const { openBuildEditor } = useOptimizePage()
  const onClick = useCallback(() => {
    openBuildEditor(characterKey)
  }, [characterKey, openBuildEditor])
  const theme = useTheme()
  const isNotXs = useMediaQuery(theme.breakpoints.up('sm'))

  return (
    <Box sx={{ display: 'flex', gap: 1, overflow: 'visible' }}>
      <Grid container spacing={2} sx={{ flexWrap: 'wrap', overflow: 'visible' }}>
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
                    <CharStatsDisplay characterKey={characterKey} />
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
                <EquippedGrid />
              </SectionAnchor>
              <SectionAnchor sectionId={OPT_SECTION_IDS.playstyle}>
                <EquippedConditionals />
              </SectionAnchor>
              <SectionAnchor sectionId={OPT_SECTION_IDS.teammates}>
                <TeammatesSection />
              </SectionAnchor>
              <SectionAnchor sectionId={OPT_SECTION_IDS.enemy}>
                <EnemyStatsSection
                  characterKey={characterKey}
                  pandoTeam={pandoTeam}
                />
              </SectionAnchor>
              <SectionAnchor sectionId={OPT_SECTION_IDS.mechanics}>
                <CharSheetDisplay characterKey={characterKey} />
              </SectionAnchor>
            </Stack>
          </Grid>
        </Grid>
    </Box>
  )
}

function EquippedConditionals() {
  const { character } = useContext(CharacterContext)
  const weapon = useWeapon(character.equippedWeapon)
  const arts = useArtifacts(character.equippedArtifacts)
  const sets = useMemo(() => {
    const counts: Partial<Record<ArtifactSetKey, number>> = {}
    for (const art of Object.values(arts)) {
      if (!art) continue
      counts[art.setKey] = (counts[art.setKey] ?? 0) + 1
    }
    return counts
  }, [arts])
  return (
    <Box>
      <Grid container spacing={1} columns={{ xs: 1, sm: 1, md: 2, lg: 3 }}>
        {weapon && (
          <Grid item xs={1}>
            <WeaponSheetDisplay weapon={weapon} />
          </Grid>
        )}
        {Object.entries(sets).map(([setKey, count]) => (
          <Grid item key={setKey} xs={1}>
            <ArtSheetDisplay
              setKey={setKey as ArtifactSetKey}
              fade2={count < 2}
              fade4={count < 4}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

import { CardThemed, useScrollRef } from '@genshin-optimizer/common/ui'
import { DebugListingsDisplay } from '@genshin-optimizer/game-opt/formula-ui'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import {
  OptConfigProvider,
  useCharOpt,
  useCharacterContext,
  useDiscSets,
  useDiscs,
  useWengine,
} from '@genshin-optimizer/zzz/db-ui'
import { own } from '@genshin-optimizer/zzz/formula'
import {
  CharStatsDisplay,
  CharacterEditor,
  DiscSheetDisplay,
  WengineSheetDisplay,
} from '@genshin-optimizer/zzz/formula-ui'
import { CharacterCard, StatHighlightContext } from '@genshin-optimizer/zzz/ui'
import {
  Box,
  CardActionArea,
  CardContent,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type { ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { BonusStatsSection } from './BonusStats'
import { EnemyStatsSection } from './EnemyStats'
import Optimize from './Optimize'
import { EquippedGrid } from './Optimize/EquippedGrid'
import GeneratedBuildsDisplay from './Optimize/GeneratedBuildsDisplay'
import { TeamHeaderHeightContext } from './context/TeamHeaderHeightContext'

const BOT_PX = 0
const SECTION_SPACING_PX = 33
const SectionNumContext = createContext(0)
export function CharacterOptDisplay() {
  const [statHighlight, setStatHighlight] = useState('')
  const statHLContextObj = useMemo(
    () => ({ statHighlight, setStatHighlight }),
    [statHighlight, setStatHighlight]
  )
  const sections: Array<[key: string, content: ReactNode]> = useMemo(() => {
    return [
      ['char', <CharacterSection key="char" />],
      ['opt', <OptimizeSection key="opt" />],
      ['builds', <BuildsSection key="builds" />],
    ] as const
  }, [])

  return (
    <StatHighlightContext.Provider value={statHLContextObj}>
      <SectionNumContext.Provider value={sections.length}>
        <Stack gap={1}>
          {sections.map(([key, content], i) => (
            <Section key={key} title={key} index={i} zIndex={100}>
              {content}
            </Section>
          ))}
        </Stack>
      </SectionNumContext.Provider>
    </StatHighlightContext.Provider>
  )
}
function Section({
  index,
  title,
  children,
  zIndex,
  top = 0,
  bottom = 0,
}: {
  index: number
  title: React.ReactNode
  children: React.ReactNode
  zIndex: number
  top?: number
  bottom?: number
}) {
  const { t } = useTranslation('page_optimize')
  const [charScrollRef, onScroll] = useScrollRef()
  const numSections = useContext(SectionNumContext)
  const headerHeight = useContext(TeamHeaderHeightContext)
  return (
    <>
      <CardThemed
        sx={(theme) => ({
          outline: `2px solid ${theme.palette.secondary.main}`,
          position: 'sticky',
          top: headerHeight + index * SECTION_SPACING_PX + top,
          bottom:
            BOT_PX + (numSections - 1 - index) * SECTION_SPACING_PX + bottom,
          zIndex,
        })}
      >
        <CardActionArea onClick={onScroll} sx={{ px: 2 }}>
          <Typography variant="h6">{t(`${title}`)}</Typography>
        </CardActionArea>
      </CardThemed>
      <Box
        ref={charScrollRef}
        sx={{
          scrollMarginTop:
            headerHeight + (index + 1) * SECTION_SPACING_PX + top,
        }}
      >
        {children}
      </Box>
    </>
  )
}
function CharacterSection() {
  const character = useCharacterContext()!
  const { key: characterKey } = character
  const [editorKey, setCharacterKey] = useState<CharacterKey | undefined>(
    undefined
  )
  const onClick = useCallback(() => {
    character?.key && setCharacterKey(character.key)
  }, [character])

  const characterInfoSections: Array<[key: string, content: ReactNode]> =
    useMemo(() => {
      return [
        ['eq', <EquippedGrid key={'eq'} onClick={onClick} />],
        ['Conditionals', <EquippedConditionals key={'conditionals'} />],
        ['bonusStats', <BonusStatsSection key={'bonusStats'} />],
        ['enemyStats', <EnemyStatsSection key={'enemyStats'} />],
      ] as const
    }, [onClick])
  const theme = useTheme()
  const isNotXs = useMediaQuery(theme.breakpoints.up('sm'))

  return (
    <>
      <CharacterEditor
        characterKey={editorKey}
        onClose={() => setCharacterKey(undefined)}
      />
      <Stack spacing={1}>
        {/* `overflow: 'visible'` for the CardThemed and CardContent is needed to allow the CharStatsDisplay to be sticky */}
        <CardThemed sx={{ overflow: 'visible' }}>
          <CardContent
            sx={{
              display: 'flex',
              gap: 1,
              overflow: 'visible',
            }}
          >
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
                sx={{
                  height: isNotXs ? '100%' : undefined,
                  overflow: 'visible',
                }}
              >
                <Stack
                  spacing={1}
                  sx={isNotXs ? { height: '100%' } : undefined}
                >
                  <CharacterCard
                    characterKey={characterKey}
                    onClick={onClick}
                  />
                  {/* This container is the "sticky" area for the stats display */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Box
                      sx={
                        isNotXs
                          ? {
                              position: 'sticky',
                              top: '115px',
                              bottom: '0px',
                            }
                          : undefined
                      }
                    >
                      <CharStatsDisplay />
                    </Box>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={5} md={7} lg={8} xl={9}>
                <Stack spacing={1.5}>
                  {characterInfoSections.map(([key, content], i) => (
                    <Section
                      key={key}
                      title={key}
                      index={i}
                      zIndex={99} // lower than the outer wrapper sections
                      // This is hardcoded to have 1 section above, and 2 below.
                      // Any changes to outer sections needs to update this.
                      top={SECTION_SPACING_PX}
                      bottom={SECTION_SPACING_PX * 2}
                    >
                      {content}
                    </Section>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </CardThemed>
        <DebugListingsDisplay
          formulasRead={own.listing.formulas}
          buffsRead={own.listing.buffs}
        />
      </Stack>
    </>
  )
}

function OptimizeSection() {
  return <Optimize />
}
function BuildsSection() {
  const { key: characterKey } = useCharacterContext()!
  const { optConfigId } = useCharOpt(characterKey)!
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
              setKey={setKey}
              fade2={count < 2}
              fade4={count < 4}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

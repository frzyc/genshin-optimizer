import { CardThemed, useScrollRef } from '@genshin-optimizer/common/ui'
import type { ArtifactSetKey, CharacterKey } from '@genshin-optimizer/gi/consts'
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
  isPortedCharacter,
  pandoCardSx,
  WeaponSheetDisplay,
} from '@genshin-optimizer/gi/formula-ui'
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
import {
  SECTION_SPACING_PX,
  STATS_STICKY_PAD_PX,
  TeamHeaderHeightContext,
} from './context/TeamHeaderHeightContext'
import { EnemyStatsSection } from './EnemyStats'
import Optimize from './Optimize'
import GeneratedBuildsDisplay from './Optimize/GeneratedBuildsDisplay'
import { TeammatesSection } from './Teammates'

const BOT_PX = 0
const SectionNumContext = createContext(0)

export function CharacterOptDisplay() {
  const sections: Array<[key: string, content: ReactNode]> = useMemo(
    () => [
      ['char', <CharacterSection key="char" />],
      ['opt', <OptimizeSection key="opt" />],
      ['builds', <BuildsSection key="builds" />],
    ],
    []
  )

  return (
    <SectionNumContext.Provider value={sections.length}>
      <Stack gap={1}>
        {sections.map(([key, content], i) => (
          <Section key={key} title={key} index={i} zIndex={100}>
            {content}
          </Section>
        ))}
      </Stack>
    </SectionNumContext.Provider>
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
  title: ReactNode
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
  const { character } = useContext(CharacterContext)
  const { key: characterKey } = character
  const pandoTeam = useRequiredPandoTeam()
  const headerHeight = useContext(TeamHeaderHeightContext)
  const ported = isPortedCharacter(characterKey)
  const [editorKey, setEditorKey] = useState<CharacterKey | undefined>()
  const onClick = useCallback(() => {
    setEditorKey(characterKey)
  }, [characterKey])
  const characterInfoSections: Array<[key: string, content: ReactNode]> =
    useMemo(() => {
      const sections: Array<[key: string, content: ReactNode]> = [
        ['eq', <EquippedGrid key="eq" />],
        ...(ported
          ? [
              ['conditionals', <EquippedConditionals key="conditionals" />] as [
                string,
                ReactNode,
              ],
            ]
          : []),
        ['teammates', <TeammatesSection key="teammates" />],
        [
          'enemyStats',
          <EnemyStatsSection
            key="enemyStats"
            characterKey={characterKey}
            pandoTeam={pandoTeam}
          />,
        ],
      ]
      sections.push([
        'charSheet',
        ported ? (
          <CharSheetDisplay key="charSheet" characterKey={characterKey} />
        ) : (
          <UnportedBanner key="charSheet" />
        ),
      ])
      return sections
    }, [characterKey, pandoTeam, ported])
  const theme = useTheme()
  const isNotXs = useMediaQuery(theme.breakpoints.up('sm'))

  return (
    <Stack spacing={1}>
      <CharacterEditor
        characterKey={editorKey}
        onClose={() => setEditorKey(undefined)}
      />
      {/* `overflow: 'visible'` for the CardThemed and CardContent is needed to allow the CharStatsDisplay to be sticky */}
      <CardThemed sx={{ overflow: 'visible', ...pandoCardSx }}>
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
              <Stack spacing={1} sx={isNotXs ? { height: '100%' } : undefined}>
                <CharacterCard characterKey={characterKey} onClick={onClick} />
                {ported && (
                  <Box sx={{ flexGrow: 1 }}>
                    <Box
                      sx={
                        isNotXs
                          ? {
                              position: 'sticky',
                              top:
                                headerHeight +
                                SECTION_SPACING_PX +
                                STATS_STICKY_PAD_PX,
                              bottom: 0,
                            }
                          : undefined
                      }
                    >
                      <CharStatsDisplay characterKey={characterKey} />
                    </Box>
                  </Box>
                )}
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
                    // 1 outer heading above (char), 2 below (opt, builds).
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
    </Stack>
  )
}

function OptimizeSection() {
  return <Optimize />
}

function BuildsSection() {
  return <GeneratedBuildsDisplay />
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

function UnportedBanner() {
  const { t } = useTranslation('page_optimize')
  return (
    <CardThemed bgt="light" sx={pandoCardSx}>
      <CardContent>
        <Typography>{t('unported')}</Typography>
      </CardContent>
    </CardThemed>
  )
}

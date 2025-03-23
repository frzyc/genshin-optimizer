import { CardThemed, useScrollRef } from '@genshin-optimizer/common/ui'
import { DebugListingsDisplay } from '@genshin-optimizer/game-opt/formula-ui'
import { type CharacterKey } from '@genshin-optimizer/sr/consts'
import { useCharacterContext } from '@genshin-optimizer/sr/db-ui'
import { own } from '@genshin-optimizer/sr/formula'
import {
  CharacterCard,
  CharacterEditor,
  EquipRow,
} from '@genshin-optimizer/sr/ui'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'
import { BonusStatsSection } from './BonusStats'
import { CharStatsDisplay } from './CharStatsDisplay'
import { LightConeSheetsDisplay } from './LightConeSheetsDisplay'
import Optimize from './Optimize'
import { RelicSheetsDisplay } from './RelicSheetsDisplay'
import { TeamHeaderHeightContext } from './context/TeamHeaderHeightContext'

const BOT_PX = 0
const SECTION_SPACING_PX = 33
const SectionNumContext = createContext(0)
export function CharacterOptDisplay() {
  const sections: Array<[key: string, title: ReactNode, content: ReactNode]> =
    useMemo(() => {
      return [
        ['char', 'Character', <CharacterSection key="char" />],
        // ['talent', 'Talent', <CharacterTalentPane key="talent" />],
        [
          'relicCond',
          'Relic Conditionals',
          <RelicSheetsDisplay key="relicCond" />,
        ],
        [
          'lightConeCond',
          'Light Cone Conditionals',
          <LightConeSheetsDisplay key="lightConeCond" />,
        ],
        ['opt', 'Optimize', <OptimizeSection key="opt" />],
      ] as const
    }, [])

  return (
    <SectionNumContext.Provider value={sections.length}>
      <Stack gap={1}>
        {sections.map(([key, title, content], i) => (
          <Section key={key} title={title} index={i}>
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
}: {
  index: number
  title: React.ReactNode
  children: React.ReactNode
}) {
  const [charScrollRef, onScroll] = useScrollRef()
  const numSections = useContext(SectionNumContext)
  const headerHeight = useContext(TeamHeaderHeightContext)
  return (
    <>
      <CardThemed
        sx={(theme) => ({
          outline: `solid ${theme.palette.secondary.main}`,
          position: 'sticky',
          top: headerHeight + index * SECTION_SPACING_PX,
          bottom: BOT_PX + (numSections - 1 - index) * SECTION_SPACING_PX,
          zIndex: 100,
        })}
      >
        <CardActionArea onClick={onScroll} sx={{ px: 1 }}>
          <Typography variant="h6">{title}</Typography>
        </CardActionArea>
      </CardThemed>
      <Box
        ref={charScrollRef}
        sx={{
          scrollMarginTop: headerHeight + (index + 1) * SECTION_SPACING_PX,
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
  return (
    <Stack spacing={1}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box sx={{ minWidth: '350px' }}>
          <CharacterCard character={character!} hideStats />
          <CharacterEditor
            characterKey={editorKey}
            onClose={() => setCharacterKey(undefined)}
          />
          <Button
            fullWidth
            disabled={!characterKey}
            onClick={() => characterKey && setCharacterKey(characterKey)}
          >
            Edit Character
          </Button>
          <CharStatsDisplay />
        </Box>
        <CurrentBuildDisplay />
      </Box>
      <BonusStatsSection />
      <DebugListingsDisplay
        formulasRead={own.listing.formulas}
        buffsRead={own.listing.buffs}
      />
    </Stack>
  )
}

function OptimizeSection() {
  return <Optimize />
}
function CurrentBuildDisplay() {
  const { equippedRelics, equippedLightCone } = useCharacterContext()!
  return (
    <CardThemed sx={{ width: '100%' }}>
      <CardContent>
        <EquipRow relicIds={equippedRelics} lightConeId={equippedLightCone} />
      </CardContent>
    </CardThemed>
  )
}

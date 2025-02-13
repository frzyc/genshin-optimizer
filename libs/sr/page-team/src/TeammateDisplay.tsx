import {
  useBoolState,
  useForceUpdate,
} from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ModalWrapper,
  NumberInputLazy,
  useScrollRef,
} from '@genshin-optimizer/common/ui'
import { DebugListingsDisplay } from '@genshin-optimizer/game-opt/formula-ui'
import { type CharacterKey } from '@genshin-optimizer/sr/consts'
import type { Frame } from '@genshin-optimizer/sr/db'
import {
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/sr/db-ui'
import { own } from '@genshin-optimizer/sr/formula'
import { CharacterCard, CharacterEditor } from '@genshin-optimizer/sr/ui'
import { Delete } from '@mui/icons-material'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  InputAdornment,
  Stack,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { BonusStatsSection } from './BonusStats'
import { BuildsDisplay, EquipRow, EquipRowTC } from './BuildsDisplay'
import { PresetContext, useTeamContext, useTeammateContext } from './context'
import { LightConeSheetsDisplay } from './LightConeSheetsDisplay'
import Optimize from './Optimize'
import { OptimizationTargetSelector } from './Optimize/OptimizationTargetSelector'
import { RelicSheetsDisplay } from './RelicSheetsDisplay'
import CharacterTalentPane from './TalentContent'
import { TeamHeaderHeightContext } from './TeamHeader'

const BOT_PX = 0
const SECTION_SPACING_PX = 33
const SectionNumContext = createContext(0)
export default function TeammateDisplay() {
  const { presetIndex } = useContext(PresetContext)
  const { team } = useTeamContext()
  const sections: Array<[key: string, title: ReactNode, content: ReactNode]> =
    useMemo(() => {
      const frame = team.frames[presetIndex]
      if (!frame) return [['char', 'Character', <CharacterSection />]]
      return [
        [
          'combo',
          `Edit Combo ${presetIndex + 1}`,
          <ComboEditorSection key="combo" />,
        ],
        ['char', 'Character', <CharacterSection key="char" />],
        ['talent', 'Talent', <CharacterTalentPane key="talent" />],
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
    }, [team, presetIndex])

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
function ComboEditorSection() {
  const { database } = useDatabaseContext()
  const { presetIndex, setPresetIndex } = useContext(PresetContext)
  const { team, teamId } = useTeamContext()
  const frame = useMemo(() => team.frames[presetIndex], [team, presetIndex])
  const setFrame = (frame: Partial<Frame>) => {
    database.teams.set(teamId, (team) => {
      team.frames = [...team.frames]
      team.frames[presetIndex] = {
        ...team.frames[presetIndex],
        ...frame,
      }
      if (!team.frames.length) setPresetIndex(0)
      else if (team.frames.length <= presetIndex)
        setPresetIndex(team.frames.length - 1)
    })
  }
  const removeFrame = () => {
    database.teams.set(teamId, (team) => {
      team.frames = team.frames.filter((_, index) => index !== presetIndex)
    })
  }
  if (!frame) return null
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <NumberInputLazy
        value={frame.multiplier}
        onChange={(v) => setFrame({ multiplier: v })}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">Multi x </InputAdornment>
          ),
        }}
      />
      <OptimizationTargetSelector
        optTarget={frame.tag}
        setOptTarget={(tag) =>
          setFrame({
            tag,
          })
        }
      />
      <Button
        size="small"
        color="error"
        onClick={removeFrame}
        startIcon={<Delete />}
      >
        Remove
      </Button>
    </Box>
  )
}
function CharacterSection() {
  const { characterKey } = useTeammateContext()
  const character = useCharacterContext()
  const [editorKey, setCharacterKey] = useState<CharacterKey | undefined>(
    undefined
  )
  return (
    <Stack spacing={1}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box sx={{ minWidth: '350px' }}>
          <CharacterCard character={character!} />
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
  const { buildType } = useTeammateContext()
  if (buildType === 'tc') return null

  return <Optimize />
}
function CurrentBuildDisplay() {
  const teammateDatum = useTeammateContext()
  const { database } = useDatabaseContext()
  const { buildType, buildId, buildTcId } = teammateDatum
  const [dbDirty, setDbDirty] = useForceUpdate()
  const buildName = useMemo(
    () => dbDirty && database.teams.getActiveBuildName(teammateDatum),
    [database.teams, dbDirty, teammateDatum]
  )
  useEffect(() => {
    let unFollow = () => {}
    if (buildType === 'real')
      unFollow = database.builds.follow(buildId, setDbDirty)
    if (buildType === 'tc')
      unFollow = database.buildTcs.follow(buildTcId, setDbDirty)
    return () => unFollow()
  }, [buildId, buildTcId, buildType, database, setDbDirty])
  const [show, onShow, onHide] = useBoolState()
  return (
    <CardThemed sx={{ width: '100%' }}>
      <BuildsModal show={show} onClose={onHide} />
      <CardHeader
        title={buildName}
        action={
          // TODO: translation
          <Button onClick={onShow} size="small">
            Change Build
          </Button>
        }
      />
      <Divider />
      <CardContent>
        {buildType === 'tc' ? <BuildTCDisplay /> : <BuildDisplay />}
      </CardContent>
    </CardThemed>
  )
}
function BuildDisplay() {
  const teammateDatum = useTeammateContext()
  const { database } = useDatabaseContext()
  const { relicIds, lightConeId } = useMemo(
    () => database.teams.getTeamActiveBuild(teammateDatum),
    [database.teams, teammateDatum]
  )
  return <EquipRow relicIds={relicIds} lightConeId={lightConeId} />
}
function BuildTCDisplay() {
  const teammateDatum = useTeammateContext()
  if (teammateDatum.buildType !== 'tc') return null
  return <EquipRowTC buildTcId={teammateDatum.buildTcId} />
}
function BuildsModal({
  show,
  onClose,
}: {
  show: boolean
  onClose: () => void
}) {
  return (
    <ModalWrapper
      open={show}
      onClose={onClose}
      containerProps={{ maxWidth: 'xl' }}
    >
      <BuildsDisplay onClose={onClose} />
    </ModalWrapper>
  )
}

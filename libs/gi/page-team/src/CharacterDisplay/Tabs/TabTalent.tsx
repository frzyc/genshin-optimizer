import {
  CardThemed,
  ConditionalWrapper,
  DropdownButton,
} from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { maxConstellationCount } from '@genshin-optimizer/gi/consts'
import {
  CharacterContext,
  TeamCharacterContext,
  useDBMeta,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { isTalentKey } from '@genshin-optimizer/gi/good'
import {
  type DocumentSection,
  type TalentSheetElementKey,
  getCharSheet,
} from '@genshin-optimizer/gi/sheets'
import {
  DataContext,
  DocumentDisplay,
  HitModeToggle,
  NodeFieldDisplay,
  ReactionToggle,
  TalentDropdown,
} from '@genshin-optimizer/gi/ui'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import { uiInput as input } from '@genshin-optimizer/gi/wr'
import {
  Box,
  CardActionArea,
  CardContent,
  Grid,
  MenuItem,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type { ReactNode } from 'react'
import { useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BuildTcContext } from '../../BuildTcContext'

const talentSpacing = {
  xs: 12,
  sm: 6,
  md: 4,
}

export default function CharacterTalentPane() {
  const { t } = useTranslation('sheet_gen')
  // Load tooltip translations
  useTranslation('tooltips_gen')
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { gender } = useDBMeta()
  const characterSheet = getCharSheet(characterKey, gender)
  const { data } = useContext(DataContext)
  const { buildTc, setBuildTc } = useContext(BuildTcContext)
  const database = useDatabase()
  const skillBurstList = [
    ['auto', t('talents.auto')],
    ['skill', t('talents.skill')],
    ['burst', t('talents.burst')],
  ] as [TalentSheetElementKey, string][]
  const passivesList: [
    tKey: TalentSheetElementKey,
    tText: string,
    asc: number,
  ][] = [
    ['passive1', t('unlockPassive1'), 1],
    ['passive2', t('unlockPassive2'), 4],
    ['passive3', t('unlockPassive3'), 0],
    ['lockedPassive', t('unlockLockedPassive'), 0],
  ]
  const ascension = data.get(input.asc).value
  const constellation = data.get(input.constellation).value

  const theme = useTheme()
  const grlg = useMediaQuery(theme.breakpoints.up('lg'))
  const constellationCards = useMemo(
    () =>
      range(1, maxConstellationCount).map((i) => (
        <SkillDisplayCard
          talentKey={`constellation${i}` as TalentSheetElementKey}
          subtitle={t('constellationLvl', { level: i })}
          onClickTitle={() =>
            buildTc?.character
              ? setBuildTc((buildTc) => {
                  if (buildTc.character) buildTc.character.constellation = i
                })
              : database.chars.set(characterKey, {
                  constellation: i === constellation ? i - 1 : i,
                })
          }
        />
      )),
    [
      t,
      buildTc?.character,
      setBuildTc,
      database.chars,
      characterKey,
      constellation,
    ]
  )

  return (
    <>
      <CardThemed bgt="light">
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <HitModeToggle size="small" />
            <ReactionToggle size="small" />
          </Box>
        </CardContent>
      </CardThemed>

      <ReactionDisplay />
      <Grid container spacing={1}>
        {/* constellations for 4column */}
        {grlg && (
          <Grid
            item
            xs={12}
            md={12}
            lg={3}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <ConstellationDropdown />
            {constellationCards.map((c, i) => (
              <Box key={i} sx={{ opacity: constellation >= i + 1 ? 1 : 0.5 }}>
                {c}
              </Box>
            ))}
          </Grid>
        )}
        <Grid item xs={12} md={12} lg={9} container spacing={1}>
          {/* auto, skill, burst */}
          {skillBurstList.map(([tKey, tText]) => (
            <Grid item key={tKey} {...talentSpacing}>
              <SkillDisplayCard talentKey={tKey} subtitle={tText} />
            </Grid>
          ))}
          {!!characterSheet.getTalentOfKey('sprint') && (
            <Grid item {...talentSpacing}>
              <SkillDisplayCard
                talentKey="sprint"
                subtitle={t('talents.altSprint')}
              />
            </Grid>
          )}
          {!!characterSheet.getTalentOfKey('passive') && (
            <Grid item {...talentSpacing}>
              <SkillDisplayCard talentKey="passive" subtitle="Passive" />
            </Grid>
          )}
          {/* passives */}
          {passivesList.map(([tKey, tText, asc]) => {
            const enabled = ascension >= asc
            if (!characterSheet.getTalentOfKey(tKey)) return null
            return (
              <Grid
                item
                key={tKey}
                style={{ opacity: enabled ? 1 : 0.5 }}
                {...talentSpacing}
              >
                <SkillDisplayCard talentKey={tKey} subtitle={tText} />
              </Grid>
            )
          })}
        </Grid>
        {/* constellations for < 4 columns */}
        {!grlg && (
          <Grid item xs={12} md={12} lg={3} container spacing={1}>
            <Grid item xs={12}>
              <ConstellationDropdown />
            </Grid>
            {constellationCards.map((c, i) => (
              <Grid
                item
                key={i}
                sx={{ opacity: constellation >= i + 1 ? 1 : 0.5 }}
                {...talentSpacing}
              >
                {c}
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
    </>
  )
}
function ReactionDisplay() {
  const { data } = useContext(DataContext)
  const reaction = data.getDisplay()['reaction'] as Record<string, CalcResult>
  return (
    <CardThemed bgt="light">
      <CardContent>
        <Grid container spacing={1}>
          {Object.entries(reaction)
            .filter(([_, node]) => !node.isEmpty)
            .map(([key, node]) => {
              return (
                <Grid item key={key}>
                  <CardThemed>
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                      <NodeFieldDisplay calcRes={node} />
                    </CardContent>
                  </CardThemed>
                </Grid>
              )
            })}
        </Grid>
      </CardContent>
    </CardThemed>
  )
}

type SkillDisplayCardProps = {
  talentKey: TalentSheetElementKey
  subtitle: string
  onClickTitle?: () => void
}
function SkillDisplayCard({
  talentKey,
  subtitle,
  onClickTitle,
}: SkillDisplayCardProps) {
  const database = useDatabase()
  const {
    teamChar: { key: characterKey },
  } = useContext(TeamCharacterContext)
  const { buildTc, setBuildTc } = useContext(BuildTcContext)

  const { gender } = useDBMeta()
  const characterSheet = getCharSheet(characterKey, gender)
  const actionWrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea onClick={onClickTitle}>{children}</CardActionArea>
    ),
    [onClickTitle]
  )

  let header: ReactNode = null

  if (isTalentKey(talentKey)) {
    header = (
      <TalentDropdown
        talentKey={talentKey}
        dropDownButtonProps={{
          sx: {
            borderRadius: 0,
            color: buildTc?.character ? 'yellow' : undefined,
          },
        }}
        setTalent={(talent) =>
          buildTc?.character
            ? setBuildTc((buildTc) => {
                if (buildTc.character?.talent[talentKey])
                  buildTc.character.talent[talentKey] = talent
              })
            : database.chars.set(characterKey, (char) => {
                char.talent[talentKey] = talent
              })
        }
      />
    )
  }
  const talentSheet = characterSheet.getTalentOfKey(talentKey)

  // Hide header if the header matches the current talent
  const hideHeader = (section: DocumentSection): boolean => {
    const headerAction = section.header?.action
    if (
      headerAction &&
      typeof headerAction !== 'string' &&
      typeof headerAction !== 'number' &&
      typeof headerAction !== 'boolean' &&
      'props' in headerAction
    ) {
      const key: string = headerAction.props.children.props.key18
      return key.includes(talentKey)
    }
    return false
  }

  return (
    <CardThemed bgt="light" sx={{ height: '100%' }}>
      {header}
      <CardContent>
        <ConditionalWrapper
          condition={!!onClickTitle}
          wrapper={actionWrapperFunc}
        >
          <Grid container sx={{ flexWrap: 'nowrap' }}>
            <Grid item>
              <Box
                component="img"
                src={talentSheet?.img}
                sx={{ width: 60, height: 'auto' }}
              />
            </Grid>
            <Grid item flexGrow={1} sx={{ pl: 1 }}>
              <Typography variant="h6">{talentSheet?.name}</Typography>
              <Typography variant="subtitle1">{subtitle}</Typography>
            </Grid>
          </Grid>
        </ConditionalWrapper>
        {/* Display document sections */}
        {talentSheet?.sections ? (
          <DocumentDisplay
            sections={talentSheet.sections}
            hideDesc
            hideHeader={hideHeader}
            collapse
          />
        ) : null}
      </CardContent>
    </CardThemed>
  )
}

export function ConstellationDropdown() {
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const { buildTc, setBuildTc } = useContext(BuildTcContext)
  const { t } = useTranslation('sheet_gen')
  const database = useDatabase()
  const constellation = data.get(input.constellation).value
  return (
    <DropdownButton
      fullWidth
      title={t('constellationLvl', { level: constellation })}
      color="primary"
      sx={{ color: buildTc?.character ? 'yellow' : undefined }}
    >
      {range(0, maxConstellationCount).map((i) => (
        <MenuItem
          key={i}
          selected={constellation === i}
          disabled={constellation === i}
          onClick={() =>
            buildTc?.character
              ? setBuildTc((buildTc) => {
                  if (buildTc.character) buildTc.character.constellation = i
                })
              : database.chars.set(characterKey, {
                  constellation: i,
                })
          }
        >
          {t('constellationLvl', { level: i })}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}

import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { notEmpty } from '@genshin-optimizer/common/util'
import type { Calculator } from '@genshin-optimizer/game-opt/engine'
import { CalcContext } from '@genshin-optimizer/game-opt/formula-ui'
import type {
  FormulaTextFunc,
  FullTagDisplayComponent,
  TagDisplayComponent,
  TagTitleColorFunc,
} from '@genshin-optimizer/game-opt/sheet-ui'
import {
  FormulaTextCacheContext,
  FormulaTextContext,
  FullTagDisplayContext,
  TagDisplayContext,
  TagTitleColorContext,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  CharacterKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import { allArtifactSetKeys } from '@genshin-optimizer/gi/consts'
import type {
  ICachedCharacter,
  PandoTeam,
  PandoTeamConditional,
  PandoTeammates,
} from '@genshin-optimizer/gi/db'
import {
  pandoTeamSrcKeys,
  pandoTeammateMembers,
} from '@genshin-optimizer/gi/db'
import {
  useArtifacts,
  useDatabase,
  useWeapon,
} from '@genshin-optimizer/gi/db-ui'
import type {
  Member,
  Tag,
  TagMapNodeEntries,
} from '@genshin-optimizer/gi/formula'
import {
  artifactsData,
  charData,
  conditionalEntries,
  convert,
  enemyDebuff,
  genshinCalculatorWithEntries,
  isMember,
  isSheet,
  ownBuff,
  ownTag,
  teamData,
  weaponData,
  withMember,
} from '@genshin-optimizer/gi/formula'
import type { ContextType, ReactNode } from 'react'
import { useMemo } from 'react'
import { FullTagDisplay, TagDisplay } from '../components/TagDisplay'
import { formulaText } from '../formulaText'
import { tagTitleColor } from '../tagLabel'

const EMPTY_ENTRIES: TagMapNodeEntries = []

const fieldTitleColor: TagTitleColorFunc = (tag) =>
  tag ? tagTitleColor(tag as Tag) : undefined

export function CharCalcProvider({
  character,
  pandoTeam,
  equippedWeapon,
  equippedArtifacts,
  children,
}: {
  character: ICachedCharacter
  pandoTeam: PandoTeam
  equippedWeapon?: string
  equippedArtifacts?: Record<ArtifactSlotKey, string | undefined>
  children: ReactNode
}) {
  const member0 = useCharacterAndEquipment(
    character,
    equippedWeapon,
    equippedArtifacts
  )
  const teammates: PandoTeammates = pandoTeam.teammates ?? ['', '', '']
  const teammate1 = useTeammateMemberEntries(
    teammates[0],
    pandoTeammateMembers[0],
    character.key
  )
  const teammate2 = useTeammateMemberEntries(
    teammates[1],
    pandoTeammateMembers[1],
    character.key
  )
  const teammate3 = useTeammateMemberEntries(
    teammates[2],
    pandoTeammateMembers[2],
    character.key
  )
  const memberKeys = useMemo(
    () => pandoTeamSrcKeys(teammates).filter(isMember),
    [teammates]
  )
  const activeMember: Member = memberKeys.includes(
    pandoTeam.activeMember as Member
  )
    ? (pandoTeam.activeMember as Member)
    : '0'

  const calc = useMemo(
    () =>
      genshinCalculatorWithEntries([
        ...teamData(memberKeys),
        ...member0,
        ...teammate1,
        ...teammate2,
        ...teammate3,
        enemyDebuff.common.lvl.add(pandoTeam.enemyLvl),
        enemyDebuff.common.preRes.add(pandoTeam.enemyPreRes),
        enemyDebuff.common.defRed_.add(pandoTeam.enemyDefRed_),
        enemyDebuff.common.defIgn.add(pandoTeam.enemyDefIgn),
        enemyDebuff.reaction.amp.add(pandoTeam.amp),
        enemyDebuff.reaction.cata.add(pandoTeam.cata),
        ownBuff.common.critMode.add(pandoTeam.critMode),
        conditionalEntries('dyn', activeMember, null)('isActive', 1),
        ...pandoTeam.conditionals.flatMap(
          ({ sheet, src, dst, condKey, condValue }) => {
            if (!isSheet(sheet) || !isMember(src)) return []
            if (dst !== null && !isMember(dst)) return []
            return [conditionalEntries(sheet, src, dst)(condKey, condValue)]
          }
        ),
      ]).withTag({ src: '0' }),
    [
      activeMember,
      member0,
      memberKeys,
      pandoTeam,
      teammate1,
      teammate2,
      teammate3,
    ]
  )

  const formulaTextCache = useMemo(
    () => new Map() as NonNullable<ContextType<typeof FormulaTextCacheContext>>,
    [calc]
  )

  return (
    <GiSheetUiProviders formulaTextCache={formulaTextCache}>
      <CalcContext.Provider value={calc as Calculator}>
        {children}
      </CalcContext.Provider>
    </GiSheetUiProviders>
  )
}

/**
 * Minimal calculator with every artifact set count mocked to 4 so 2pc/4pc
 * conditionals can render in the optimizer set-config UI.
 */
export function CharCalcMockCountProvider({
  character,
  conditionals,
  children,
}: {
  character: ICachedCharacter
  conditionals: readonly PandoTeamConditional[]
  children: ReactNode
}) {
  const calc = useMemo(
    () =>
      genshinCalculatorWithEntries([
        ...teamData(['0']),
        ...withMember(
          '0',
          ...charData(character),
          ...artifactsData([]),
          ...allArtifactSetKeys.map((set: ArtifactSetKey) =>
            convert(ownTag, { sheet: 'art', et: 'own' })
              .common.count.sheet(set)
              .add(4)
          )
        ),
        ownBuff.common.critMode.add('avg'),
        enemyDebuff.common.lvl.add(100),
        enemyDebuff.common.preRes.add(0.1),
        ...conditionals.flatMap(({ sheet, src, dst, condKey, condValue }) => {
          if (!isSheet(sheet) || !isMember(src)) return []
          if (dst !== null && !isMember(dst)) return []
          return [conditionalEntries(sheet, src, dst)(condKey, condValue)]
        }),
      ]).withTag({ src: '0' }),
    [character, conditionals]
  )

  const formulaTextCache = useMemo(
    () => new Map() as NonNullable<ContextType<typeof FormulaTextCacheContext>>,
    [calc]
  )

  return (
    <GiSheetUiProviders formulaTextCache={formulaTextCache}>
      <CalcContext.Provider value={calc as Calculator}>
        {children}
      </CalcContext.Provider>
    </GiSheetUiProviders>
  )
}

function GiSheetUiProviders({
  children,
  formulaTextCache,
}: {
  children: ReactNode
  formulaTextCache: ContextType<typeof FormulaTextCacheContext>
}) {
  return (
    <FormulaTextCacheContext.Provider value={formulaTextCache}>
      <FormulaTextContext.Provider value={formulaText as FormulaTextFunc}>
        <TagDisplayContext.Provider value={TagDisplay as TagDisplayComponent}>
          <FullTagDisplayContext.Provider
            value={FullTagDisplay as FullTagDisplayComponent}
          >
            <TagTitleColorContext.Provider value={fieldTitleColor}>
              {children}
            </TagTitleColorContext.Provider>
          </FullTagDisplayContext.Provider>
        </TagDisplayContext.Provider>
      </FormulaTextContext.Provider>
    </FormulaTextCacheContext.Provider>
  )
}

function useCharacterAndEquipment(
  character: ICachedCharacter,
  equippedWeapon: string | undefined,
  equippedArtifacts: Record<ArtifactSlotKey, string | undefined> | undefined
) {
  const weapon = useWeapon(equippedWeapon ?? character.equippedWeapon)
  const arts = useArtifacts(equippedArtifacts ?? character.equippedArtifacts)
  return useMemo(
    (): TagMapNodeEntries =>
      memberAndEquipmentEntries('0', character, weapon, arts),
    [arts, character, weapon]
  )
}

function useTeammateMemberEntries(
  teammateKey: CharacterKey | '',
  src: Member,
  mainCharacterKey: CharacterKey
) {
  const database = useDatabase()
  const character = useDataManagerBase(
    database.chars,
    teammateKey as CharacterKey
  )
  const weapon = useWeapon(character?.equippedWeapon)
  const arts = useArtifacts(character?.equippedArtifacts)
  return useMemo(() => {
    if (
      !teammateKey ||
      !character ||
      teammateKey === mainCharacterKey ||
      !isMember(src)
    )
      return EMPTY_ENTRIES
    return memberAndEquipmentEntries(src, character, weapon, arts)
  }, [arts, character, mainCharacterKey, src, teammateKey, weapon])
}

function memberAndEquipmentEntries(
  src: Member,
  character: ICachedCharacter,
  weapon: ReturnType<typeof useWeapon>,
  arts: ReturnType<typeof useArtifacts>
): TagMapNodeEntries {
  const artList = Object.values(arts)
    .filter(notEmpty)
    .map((art) => ({
      set: art.setKey,
      stats: [
        { key: art.mainStatKey, value: art.mainStatVal },
        ...art.substats
          .filter((s): s is typeof s & { key: SubstatKey } => !!s.key)
          .map((s) => ({
            key: s.key,
            value: s.accurateValue || s.value,
          })),
      ],
    }))
  return withMember(
    src,
    ...charData(character),
    ...(weapon ? weaponData(weapon) : []),
    ...artifactsData(artList)
  )
}

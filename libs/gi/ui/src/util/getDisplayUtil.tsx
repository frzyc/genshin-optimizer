import { ColorText, ImgIcon } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { artifactDefIcon, weaponAsset } from '@genshin-optimizer/gi/assets'
import type {
  ArtifactSetKey,
  CharacterKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import type { ArtCharDatabase } from '@genshin-optimizer/gi/db'
import { getCharSheet } from '@genshin-optimizer/gi/sheets'
import type { CalcResult, UIData } from '@genshin-optimizer/gi/uidata'
import type { DisplaySub } from '@genshin-optimizer/gi/wr'
import { input } from '@genshin-optimizer/gi/wr'
import BarChartIcon from '@mui/icons-material/BarChart'
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'
import GroupsIcon from '@mui/icons-material/Groups'
import type { ReactNode } from 'react'
import { ArtifactSetName, WeaponName } from '../components'
const errHeader = {
  title: <ColorText color="warning">ERROR</ColorText>,
}

const talentMap = {
  normal: 'Normal Atk.',
  charged: 'Charged Atk.',
  plunging: 'Plunging Atk.',
  skill: 'Ele. Skill',
  burst: 'Ele. Burst',
  passive: 'Passive',
  passive1: '1st Asc. Pass.',
  passive2: '4th Asc. Pass.',
  passive3: 'Util. Pass.',
  ...Object.fromEntries(
    range(1, 6).map((i) => [`constellation${i}`, `Const. ${i}`]),
  ),
}

export function getDisplayHeader(
  data: UIData,
  sectionKey: string,
  database: ArtCharDatabase,
): {
  title: ReactNode
  icon?: ReactNode
  action?: ReactNode
} {
  if (!sectionKey) return errHeader
  if (sectionKey === 'basic') return { title: 'Basic Stats' }
  if (sectionKey === 'character') return { title: 'Character' }
  if (sectionKey === 'bonusStats')
    return { title: 'Bonus Stats', icon: <BarChartIcon /> }
  if (sectionKey === 'custom')
    return { title: 'Custom Multi Target', icon: <DashboardCustomizeIcon /> }
  if (sectionKey === 'teamBuff')
    return { title: 'Received Team Buffs', icon: <GroupsIcon /> }
  else if (sectionKey === 'reaction')
    return { title: 'Transformative Reactions' }
  else if (sectionKey.includes(':')) {
    const [namespace, key] = sectionKey.split(':')
    if (namespace === 'artifact') {
      return {
        title: <ArtifactSetName setKey={key as ArtifactSetKey} />,
        icon: <ImgIcon size={2} src={artifactDefIcon(key as ArtifactSetKey)} />,
      }
    } else if (namespace === 'weapon') {
      const asc = data.get(input.weapon.asc).value
      return {
        title: <WeaponName weaponKey={key as WeaponKey} />,
        icon: (
          <ImgIcon size={2} src={weaponAsset(key as WeaponKey, asc >= 2)} />
        ),
      }
    }
  } else {
    const cKey = data.get(input.charKey).value
    if (!cKey) return errHeader
    const sheet = getCharSheet(cKey as CharacterKey, database.gender)
    const talentKey = ['normal', 'charged', 'plunging'].includes(sectionKey)
      ? 'auto'
      : sectionKey
    const talent = sheet?.getTalentOfKey(talentKey as any)
    if (!talent) return errHeader
    const actionText = talentMap[sectionKey as keyof typeof talentMap]
    return {
      icon: <ImgIcon size={2} src={talent.img} />,
      title: talent.name,
      action: actionText,
    }
  }
  return errHeader
}

type DisplaySections = Array<[key: string, results: DisplaySub<CalcResult>]>
/**
 * Use this function to reorganize the sections to have basic stats, custom at the beginning, and reaction at the end.
 * @param data
 * @returns
 */
export function getDisplaySections(data: UIData): DisplaySections {
  const display = data.getDisplay()
  const teamBuff = data.getTeamBuff()
  const sections = Object.entries(display)
  const basic = sections.filter(([k]) => k === 'basic')
  const reaction = sections.filter(([k]) => k === 'reaction')
  const custom = sections.filter(([k]) => k === 'custom')
  const weapon = sections.filter(([k]) => k.startsWith('weapon'))
  const artifact = sections.filter(([k]) => k.startsWith('artifact'))
  const rest = sections.filter(
    ([k]) =>
      k !== 'basic' &&
      k !== 'reaction' &&
      !k.startsWith('weapon') &&
      !k.startsWith('artifact') &&
      k !== 'custom',
  )
  return [
    ...basic,
    ['character', data.getCharacterStats()],
    ['bonusStats', data.getBonusStats()],
    ...reaction,
    ...custom,
    ...rest,
    ...weapon,
    ...artifact,
    [
      'teamBuff',
      [
        ...Object.values(teamBuff.total ?? {}),
        ...Object.values(teamBuff.premod ?? {}),
        ...Object.values(teamBuff.enemy ?? {}),
      ],
    ],
  ] as DisplaySections
}

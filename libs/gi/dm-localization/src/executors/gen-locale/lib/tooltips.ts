import {
  avatarSkillDepotExcelConfigData,
  hyperLinkNameExcelConifgData,
  proudSkillExcelConfigData,
} from '@genshin-optimizer/gi/dm'

export function replaceLinkWithTooltip(string: string, namespace: string) {
  return (_match: string, type: string, id: string) => {
    switch (type) {
      case 'P':
        return replacePassiveLinkWithTooltip(id, string, namespace)
      case 'S':
        return replaceTalentLinkWithTooltip(id, string, namespace)
      case 'T':
        return replaceConstellationLinkWithTooltip(id, string, namespace)
      case 'N':
        return replaceHyperlinkWithTooltip(id)
      default:
        throw new Error(
          `Unexpected type ${type} for tooltip id ${id}.\nRaw string: ${string}`
        )
    }
  }
}

function replacePassiveLinkWithTooltip(
  id: string,
  string: string,
  namespace: string
) {
  // ProudSkillExcelConfigData
  let passive = ''
  // Use .find since it returns early
  const data = Object.values(avatarSkillDepotExcelConfigData).find((data) =>
    data.inherentProudSkillOpens.find((p, i) => {
      if (
        p.proudSkillGroupId &&
        proudSkillExcelConfigData[
          p.proudSkillGroupId
        ][0].proudSkillId.toString() === id
      ) {
        passive = ['passive1', 'passive2', 'passive3', '', 'passive'][i]
        return true
      }
      return false
    })
  )
  if (!data)
    throw new Error(`Failed to find passive ${id} for tooltip for ${string}`)

  return `<tooltip ns=${namespace} baseKey18=${passive}>`
}

function replaceTalentLinkWithTooltip(
  id: string,
  string: string,
  namespace: string
) {
  // AvatarSkillExcelConfigData
  let talent = ''
  // Use .find since it returns early
  const data = Object.values(avatarSkillDepotExcelConfigData).find((data) => {
    if (id === data.energySkill.toString()) {
      talent = 'burst'
      return true
    } else if (
      data.skills.find((s, i) => {
        if (id === s.toString()) {
          talent = ['normal', 'skill', 'sprint'][i]
          return true
        }
        return false
      })
    )
      return true
    else return false
  })
  if (!data)
    throw new Error(`Failed to find talent ${id} for tooltip for ${string}`)

  return `<tooltip ns=${namespace} baseKey18=${talent}>`
}

function replaceConstellationLinkWithTooltip(
  id: string,
  string: string,
  namespace: string
) {
  // AvatarTalentExcelConfigData
  let constellation = -1
  // Use .find since it returns early
  const data = Object.values(avatarSkillDepotExcelConfigData).find((data) =>
    data.talents.find((t, i) => {
      if (id === t.toString()) {
        constellation = i + 1
        return true
      }
      return false
    })
  )
  if (!data)
    throw new Error(`Failed to find talent ${id} for tooltip for ${string}`)

  return `<tooltip ns=${namespace} baseKey18=constellation${constellation}>`
}

function replaceHyperlinkWithTooltip(id: string) {
  // HyperlinkNameExcelConifgData
  const { color, descParamList } = hyperLinkNameExcelConifgData[id]
  const values = JSON.stringify(descParamList.filter((d) => d !== ''))
  return `<tooltip ns=tooltips_gen baseKey18=${id} values=${values}${color ? ` color=#${color}` : ''}>`
}

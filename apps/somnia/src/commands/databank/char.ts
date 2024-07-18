import { AssetData } from '@genshin-optimizer/sr/assets-data'
import type { CharacterDataKey } from '@genshin-optimizer/sr/consts'
import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import { createYattaUrl } from '../../lib/util'
import { clean, skillsList } from '../databank'

function getEmbed(
  id: CharacterDataKey,
  name: string,
  data: any,
  talent: string
) {
  //character profile
  if (talent === 'p') return profileEmbed(id, name, data)
  //normal/charged/plunging attacks
  else if (talent === 'n') return skillEmbed('basic', id, name, data)
  //elemental skill
  else if (talent === 'e') return skillEmbed('skill', id, name, data)
  //elemental burst
  else if (talent === 'u') return skillEmbed('ult', id, name, data)
  //technique
  else if (talent === 't') return skillEmbed('technique', id, name, data)
  //overworld
  else if (talent === 'o') return skillEmbed('overworld', id, name, data)
  //constellations
  else if (talent.match(/c[123456]?/))
    return eidolonsEmbed(id, name, data, talent)
  else throw 'Invalid talent name.'
}

function getAssets(id: CharacterDataKey) {
  return AssetData.chars[id]
}

function baseEmbed(id: CharacterDataKey, name: string) {
  // TODO: const icon = getAssets(id).icon
  // TODO: const element = allStats.char[id].damageType
  return new EmbedBuilder()
    .setFooter({
      text: 'Character Archive',
    })
    .setAuthor({
      name: name,
      iconURL: 'createAmbrUrl(icon)',
    })
  //.setColor(elementColors[element])
}

function profileEmbed(id: CharacterDataKey, name: string, data: any) {
  // TODO: const element = allStats.char[id].damageType
  const text =
    data.description ??
    'A traveler from another world who had their only kin taken away, forcing them to embark on a journey to find The Seven.'
  const embed = baseEmbed(id, name)
  if (data.title) embed.setTitle(data.title)
  embed
    .setAuthor({
      name: name,
      // TODO: iconURL: 'createAmbrUrl(CommonAssetData.elemIcons[element])',
    })
    .setDescription(clean(text))
  const thumbnail = getAssets(id).icon
  if (thumbnail) embed.setThumbnail(createYattaUrl('avatar/medium', thumbnail))
  return embed
}

function skillEmbed(
  ability: string,
  id: CharacterDataKey,
  name: string,
  data: any
) {
  let text = ''
  const skills = data.abilities[ability]
  for (const skill of skills) {
    text += `**${skill.name}**\n`
    text += skill.shortDesc + '\n\n'
  }
  const embed = baseEmbed(id, name).setDescription(clean(text))
  const thumbnail = getAssets(id).skill
  if (thumbnail) embed.setThumbnail(createYattaUrl('skill', thumbnail))
  return embed
}

function eidolonsEmbed(
  id: CharacterDataKey,
  name: string,
  data: any,
  arg: string
) {
  let text = ''
  //select constellations
  const allCons = ['1', '2', '3', '4', '5', '6'] as const
  const showCons =
    arg === 'c' ? allCons : allCons.filter((e) => e.includes(arg[1]))
  for (const constellationId of showCons) {
    const constellation = data.ranks[constellationId]
    text +=
      `**${constellationId}. ${constellation.name}** ` +
      constellation.desc +
      '\n\n'
  }
  //make embed
  const embed = baseEmbed(id, name).setDescription(clean(text))
  if (data.constellationName) embed.setTitle(data.constellationName)
  const thumbnail = getAssets(id)[`eidolon${showCons[0]}`]
  if (thumbnail) embed.setThumbnail(createYattaUrl('skill', thumbnail))
  return embed
}

export function charBank(
  id: CharacterDataKey,
  name: string,
  data: any,
  args: string
) {
  const embed = getEmbed(id, name, data, args)

  //create dropdown menu
  const options = []
  for (const skill of Object.values(skillsList)) {
    const menu = new StringSelectMenuOptionBuilder()
      .setLabel(skill.name)
      .setValue(skill.value)
    if (skill.value === args) menu.setDefault(true)
    options.push(menu)
  }
  const components = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`databank char ${id} ${args}`)
      .setPlaceholder(skillsList[args[0] as keyof typeof skillsList].name)
      .addOptions(options)
  )

  return {
    content: '',
    embeds: [embed],
    components: [components],
  }
}

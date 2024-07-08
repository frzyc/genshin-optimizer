import { AssetData, CommonAssetData } from '@genshin-optimizer/gi/assets-data'
import type {
  CharacterKey,
  LocationGenderedCharacterKey,
  TravelerKey,
} from '@genshin-optimizer/gi/consts'
import { getCharEle, getCharStat } from '@genshin-optimizer/gi/stats'
import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import { elementColors } from '../../assets/assets'
import { createAmbrUrl } from '../../lib/util'
import { clean, talentlist } from '../archive'

function getEmbed(id: CharacterKey, name: string, data: any, talent: string) {
  //character profile
  if (talent === 'p') return profileEmbed(id, name, data)
  //normal/charged/plunging attacks
  else if (talent === 'n') return normalsEmbed(id, name, data)
  //elemental skill
  else if (talent === 'e') return skillEmbed(id, name, data)
  //elemental burst
  else if (talent === 'q') return burstEmbed(id, name, data)
  //passives
  else if (talent.match(/a\d?/)) return passivesEmbed(id, name, data, talent)
  //constellations
  else if (talent.match(/c[123456]?/))
    return constellationsEmbed(id, name, data, talent)
  else throw 'Invalid talent name.'
}

function getAssets(id: CharacterKey) {
  let genderedId: LocationGenderedCharacterKey | TravelerKey = id
  if (id.includes('Traveler')) {
    if (Math.random() < 0.5) genderedId = 'TravelerM'
    else genderedId = 'TravelerF'
  }
  return AssetData.chars[genderedId]
}

function baseEmbed(id: CharacterKey, name: string) {
  const element = getCharEle(id)
  let icon = getAssets(id).icon
  if (!icon) icon = CommonAssetData.elemIcons[element]
  return new EmbedBuilder()
    .setFooter({
      text: 'Character Archive',
    })
    .setAuthor({
      name: name,
      iconURL: createAmbrUrl(icon),
    })
    .setColor(elementColors[element])
}

function profileEmbed(id: CharacterKey, name: string, data: any) {
  const element = getCharEle(id)
  const text =
    data.description ??
    'A traveler from another world who had their only kin taken away, forcing them to embark on a journey to find The Seven.'
  const embed = baseEmbed(id, name)
  if (data.title) embed.setTitle(data.title)
  embed
    .setAuthor({
      name: name,
      iconURL: createAmbrUrl(CommonAssetData.elemIcons[element]),
    })
    .setDescription(clean(text))
  const thumbnail = getAssets(id).icon
  if (thumbnail) embed.setThumbnail(createAmbrUrl(thumbnail))
  return embed
}

function normalsEmbed(id: CharacterKey, name: string, data: any) {
  const weapon = getCharStat(id).weaponType
  return baseEmbed(id, name)
    .setTitle(data.auto.name)
    .setDescription(
      clean(
        Object.values(data.auto.fields.normal).join('\n') +
          '\n\n' +
          Object.values(data.auto.fields.charged).join('\n') +
          '\n\n' +
          Object.values(data.auto.fields.plunging).join('\n') +
          '\n\n'
      )
    )
    .setThumbnail(createAmbrUrl(CommonAssetData.normalIcons[weapon]))
}

function skillEmbed(id: CharacterKey, name: string, data: any) {
  const embed = baseEmbed(id, name)
    .setTitle(data.skill.name)
    .setDescription(
      clean(Object.values(data.skill.description).flat().join('\n'))
    )
  const thumbnail = getAssets(id).skill
  if (thumbnail) embed.setThumbnail(createAmbrUrl(thumbnail))
  return embed
}

function burstEmbed(id: CharacterKey, name: string, data: any) {
  const embed = baseEmbed(id, name)
    .setTitle(data.burst.name)
    .setDescription(
      clean(Object.values(data.burst.description).flat().join('\n'))
    )
  const thumbnail = getAssets(id).burst
  if (thumbnail) embed.setThumbnail(createAmbrUrl(thumbnail))
  return embed
}

function passivesEmbed(id: CharacterKey, name: string, data: any, arg: string) {
  let text = ''
  //list all passives
  let showPassives = Object.keys(data).filter((e) =>
    e.startsWith('passive')
  ) as ('passive1' | 'passive2' | 'passive3' | 'passive')[]
  //input to select a passive
  if (arg.length > 1) {
    if (arg[1] === '1') showPassives = ['passive1']
    else if (arg[1] === '4') showPassives = ['passive2']
    else showPassives = showPassives.slice(2)
  }
  //make embed
  for (const passiveId of showPassives) {
    const passive = data[passiveId]
    //ascension 1
    if (passiveId === 'passive1') text += `**${passive.name}** (A1)\n`
    //ascension 4
    else if (passiveId === 'passive2') text += `**${passive.name}** (A4)\n`
    //innate passives
    else text += `**${passive.name}** \n`
    text += Object.values(passive.description).flat().join('\n') + '\n\n'
  }
  const embed = baseEmbed(id, name).setDescription(clean(text))
  const thumbnail = getAssets(id)[showPassives[0]]
  if (thumbnail) embed.setThumbnail(createAmbrUrl(thumbnail))
  return embed
}

function constellationsEmbed(
  id: CharacterKey,
  name: string,
  data: any,
  arg: string
) {
  let text = ''
  const allCons = ['1', '2', '3', '4', '5', '6'] as const
  const showCons =
    arg === 'c' ? allCons : allCons.filter((e) => e.includes(arg[1]))
  for (const constellationId of showCons) {
    const constellation = data[`constellation${constellationId}`]
    text +=
      `**${constellationId}. ${constellation.name}** ` +
      Object.values(constellation.description).flat().join('\n') +
      '\n\n'
  }
  //make embed
  const embed = baseEmbed(id, name).setDescription(clean(text))
  if (data.constellationName) embed.setTitle(data.constellationName)
  const thumbnail = getAssets(id)[`constellation${showCons[0]}`]
  if (thumbnail) embed.setThumbnail(createAmbrUrl(thumbnail))
  return embed
}

export function charArchive(
  id: CharacterKey,
  name: string,
  data: any,
  args: string
) {
  const embed = getEmbed(id, name, data, args)

  //create dropdown menu
  const options = []
  for (const talent of Object.values(talentlist)) {
    const menu = new StringSelectMenuOptionBuilder()
      .setLabel(talent.name)
      .setValue(talent.value)
    if (talent.value === args) menu.setDefault(true)
    options.push(menu)
  }
  const components = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`archive char ${id} ${args}`)
      .setPlaceholder(talentlist[args[0] as keyof typeof talentlist].name)
      .addOptions(options)
  )

  return {
    content: '',
    embeds: [embed],
    components: [components],
  }
}

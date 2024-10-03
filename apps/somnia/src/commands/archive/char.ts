import { getUnitStr, valueString } from '@genshin-optimizer/common/util'
import { AssetData, CommonAssetData } from '@genshin-optimizer/gi/assets-data'
import type {
  CharacterKey,
  LocationGenderedCharacterKey,
  TravelerKey,
} from '@genshin-optimizer/gi/consts'
import { i18nInstance } from '@genshin-optimizer/gi/i18n-node'
import { getCharEle, getCharStat } from '@genshin-optimizer/gi/stats'
import type { MessageReaction } from 'discord.js'
import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import { elementColors } from '../../assets/assets'
import { giURL } from '../../lib/util'
import { clean, talentlist, translate } from '../archive'
import { baseCharStats, getFixed } from '../go/calculator'

function getEmbed(
  id: CharacterKey,
  namespace: string,
  lang: string,
  arg: string
) {
  //character profile
  if (arg === 'p') return profileEmbed(id, namespace, lang)
  //normal/charged/plunging attacks
  else if (arg === 'n') return normalsEmbed(id, namespace, lang)
  //elemental skill
  else if (arg === 'e') return skillEmbed(id, namespace, lang)
  //elemental burst
  else if (arg === 'q') return burstEmbed(id, namespace, lang)
  //passives
  else if (arg.match(/^a[14]?$/)) return passivesEmbed(id, namespace, lang, arg)
  //constellations
  else if (arg.match(/^c[123456]?$/))
    return constellationsEmbed(id, namespace, lang, arg)
  else throw 'Invalid talent name.'
}

function getAssets(id: CharacterKey) {
  let genderedId: LocationGenderedCharacterKey | TravelerKey = id
  if (id.includes('Traveler')) genderedId = 'TravelerM'
  return AssetData.chars[genderedId]
}

function getName(id: CharacterKey, lang: string) {
  if (id.includes('Traveler')) return id.replace('Traveler', 'Traveler (') + ')'
  else return translate(`char_${id}_gen`, 'name', lang)
}

function baseEmbed(id: CharacterKey, lang: string) {
  const element = getCharEle(id)
  let icon = getAssets(id).icon
  if (!icon) icon = CommonAssetData.elemIcons[element]
  return new EmbedBuilder()
    .setFooter({
      text: 'Character Archive',
    })
    .setAuthor({
      name: getName(id, lang),
      iconURL: giURL(icon),
    })
    .setColor(elementColors[element])
}

function profileEmbed(id: CharacterKey, namespace: string, lang: string) {
  const element = getCharEle(id)
  let text = ''
  //base stats
  const stats = baseCharStats(id)
  Object.entries(stats).forEach(([key, val]) => {
    const name = i18nInstance.t(`statKey_gen:${key}`)
    const value = valueString(val, getUnitStr(key), getFixed(key))
    text += `**${name}:** ${value}\n`
  })
  //description
  text +=
    '\n-# *' +
    i18nInstance.t(
      [
        `${namespace}:description`,
        'A traveler from another world who had their only kin taken away, forcing them to embark on a journey to find The Seven.',
      ],
      { lng: lang }
    ) +
    '*'
  //make embed
  const embed = baseEmbed(id, lang)
  const title = translate(namespace, 'title', lang)
  if (title != 'title') embed.setTitle(title)
  embed
    .setAuthor({
      name: getName(id, lang),
      iconURL: giURL(CommonAssetData.elemIcons[element]),
    })
    .setDescription(clean(text))
  const thumbnail = getAssets(id).icon
  if (thumbnail) embed.setThumbnail(giURL(thumbnail))
  return embed
}

function normalsEmbed(id: CharacterKey, namespace: string, lang: string) {
  const weapon = getCharStat(id).weaponType
  const auto = translate(namespace, 'auto', lang, true)
  return baseEmbed(id, lang)
    .setTitle(auto.name)
    .setDescription(
      clean(
        Object.values(auto.fields.normal).join('\n') +
          '\n\n' +
          Object.values(auto.fields.charged).join('\n') +
          '\n\n' +
          Object.values(auto.fields.plunging).join('\n') +
          '\n\n'
      )
    )
    .setThumbnail(giURL(CommonAssetData.normalIcons[weapon]))
}

function skillEmbed(id: CharacterKey, namespace: string, lang: string) {
  const skill = translate(namespace, 'skill', lang, true)
  const embed = baseEmbed(id, lang)
    .setTitle(skill.name)
    .setDescription(clean(Object.values(skill.description).flat().join('\n')))
  const thumbnail = getAssets(id).skill
  if (thumbnail) embed.setThumbnail(giURL(thumbnail))
  return embed
}

function burstEmbed(id: CharacterKey, namespace: string, lang: string) {
  const burst = translate(namespace, 'burst', lang, true)
  const embed = baseEmbed(id, lang)
    .setTitle(burst.name)
    .setDescription(clean(Object.values(burst.description).flat().join('\n')))
  const thumbnail = getAssets(id).burst
  if (thumbnail) embed.setThumbnail(giURL(thumbnail))
  return embed
}

type Passives = 'passive1' | 'passive2' | 'passive3' | 'passive'
function selectPassive(arg: string): Passives[] {
  if (arg.length > 1) {
    if (arg[1] === '1') return ['passive1']
    if (arg[1] === '4') return ['passive2']
  }
  return ['passive1', 'passive2', 'passive3', 'passive']
}

function passivesEmbed(
  id: CharacterKey,
  namespace: string,
  lang: string,
  arg: string
) {
  let text = ''
  //select passives
  const showPassives = selectPassive(arg)
  //make embed
  for (const passiveId of showPassives) {
    const passive = translate(namespace, passiveId, lang, true)
    if (passive == passiveId) continue
    //ascension 1
    if (passiveId === 'passive1') text += `**${passive.name}** (A1)\n`
    //ascension 4
    else if (passiveId === 'passive2') text += `**${passive.name}** (A4)\n`
    //innate passives
    else text += `**${passive.name}** \n`
    //passive text
    text += Object.values(passive.description).flat().join('\n') + '\n\n'
  }
  const embed = baseEmbed(id, lang).setDescription(clean(text))
  const thumbnail = getAssets(id)[showPassives[0]]
  if (thumbnail) embed.setThumbnail(giURL(thumbnail))
  return embed
}

function constellationsEmbed(
  id: CharacterKey,
  namespace: string,
  lang: string,
  arg: string
) {
  let text = ''
  //select constellations
  const allCons = ['1', '2', '3', '4', '5', '6'] as const
  const showCons =
    arg.length > 1 ? allCons.filter((e) => e.includes(arg[1])) : allCons
  for (const constellationId of showCons) {
    const constellation = translate(
      namespace,
      `constellation${constellationId}`,
      lang,
      true
    )
    text +=
      `**${constellationId}. ${constellation.name}** ` +
      Object.values(constellation.description).flat().join('\n') +
      '\n\n'
  }
  //make embed
  const embed = baseEmbed(id, lang).setDescription(clean(text))
  const constellationName = translate(namespace, 'constellationName', lang)
  if (constellationName != 'constellationName')
    embed.setTitle(constellationName)
  const thumbnail = getAssets(id)[`constellation${showCons[0]}`]
  if (thumbnail) embed.setThumbnail(giURL(thumbnail))
  return embed
}

export async function charArchive(
  id: CharacterKey,
  lang: string,
  args: string
) {
  const namespace = id.includes('Traveler')
    ? `char_${id}M_gen`
    : `char_${id}_gen`
  await i18nInstance.loadNamespaces(namespace)
  const embed = getEmbed(id, namespace, lang, args)

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
      .setCustomId(`archive char ${id} ${lang} ${args}`)
      .setPlaceholder(talentlist[args[0] as keyof typeof talentlist].name)
      .addOptions(options)
  )

  return {
    content: '',
    embeds: [embed],
    components: [components],
  }
}

export async function charReaction(reaction: MessageReaction) {
  let message = reaction.message
  if (message.partial) message = await message.fetch()

  if (!message.embeds[0]) return
  const embed = message.embeds[0].toJSON()

  const emoji = reaction.emoji.name

  //reactions to change traveler gender
  if (
    embed.author?.name.includes('Traveler') &&
    embed.author.icon_url &&
    embed.thumbnail
  ) {
    let gender = ''
    //determine gender
    if (emoji === '🏳️‍⚧️')
      gender =
        embed.author.icon_url?.includes('Girl') ||
        embed.thumbnail?.url.includes('Girl')
          ? 'M'
          : 'F'
    else if (emoji === '♀️') gender = 'F'
    else if (emoji === '♂️') gender = 'M'
    else return
    //replace gender
    if (gender === 'F') {
      embed.author.icon_url = embed.author.icon_url.replace('Boy', 'Girl')
      embed.thumbnail.url = embed.thumbnail.url.replace('Boy', 'Girl')
    } else if (gender === 'M') {
      embed.author.icon_url = embed.author.icon_url.replace('Girl', 'Boy')
      embed.thumbnail.url = embed.thumbnail.url.replace('Girl', 'Boy')
    }
  } else return

  //edit message
  try {
    await message.edit({ embeds: [embed] })
  } catch (e) {
    console.log(e)
  }
  return
}

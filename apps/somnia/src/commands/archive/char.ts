import { getUnitStr, valueString } from '@genshin-optimizer/common/util'
import { AssetData, CommonAssetData } from '@genshin-optimizer/gi/assets-data'
import {
  type CharacterSheetKey,
  type LocationGenderedCharacterKey,
  sheetKeyToCharKey,
} from '@genshin-optimizer/gi/consts'
import { i18nInstance } from '@genshin-optimizer/gi/i18n-node'
import {
  getCharEle,
  getCharParam,
  getCharStat,
} from '@genshin-optimizer/gi/stats'
import type { AnyComponentBuilder, MessageReaction } from 'discord.js'
import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import { elementColors } from '../../assets/assets'
import { giURL } from '../../lib/util'
import { clean, slashcommand, talentlist, translate } from '../archive'
import { baseCharStats, getFixed } from '../go/calculator'

function getEmbed(
  id: CharacterSheetKey,
  namespace: string,
  arg: string,
  lang: string
) {
  const res: { embed: EmbedBuilder; components: AnyComponentBuilder[] } = {
    embed: {} as EmbedBuilder,
    components: [],
  }
  //parse level
  let level = arg.length > 1 ? parseInt(arg.substring(1)) : NaN

  //talent level dropdown
  if ('neq'.includes(arg[0])) {
    if (isNaN(level)) level = 10

    //create dropdown menu
    const options = []
    for (const tl of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]) {
      const menu = new StringSelectMenuOptionBuilder()
        .setLabel('Talent Level ' + tl)
        .setValue(arg[0] + tl)
      if (tl === level) menu.setDefault(true)
      options.push(menu)
    }
    res.components = [
      new StringSelectMenuBuilder()
        .setCustomId(`${slashcommand.name} char ${id} ${arg} ${lang} 1`)
        .setPlaceholder('Talent Level ' + level)
        .addOptions(options),
    ]
  }

  //character profile
  if (arg === 'p') res.embed = profileEmbed(id, namespace, lang)
  //normal/charged/plunging attacks
  else if (arg[0] === 'n') res.embed = normalsEmbed(id, namespace, level, lang)
  //elemental skill
  else if (arg[0] === 'e') res.embed = skillEmbed(id, namespace, level, lang)
  //elemental burst
  else if (arg[0] === 'q') res.embed = burstEmbed(id, namespace, level, lang)
  //passives
  else if (arg[0] === 'a') res.embed = passivesEmbed(id, namespace, level, lang)
  //constellations
  else if (arg[0] === 'c') {
    res.embed = constellationsEmbed(id, namespace, level, lang)

    //create dropdown menu
    const options = []
    for (const cl of [0, 1, 2, 3, 4, 5, 6]) {
      const label = cl ? 'Constellation ' + cl : 'All Constellations'
      const value = cl ? 'c' + cl : 'c'
      const menu = new StringSelectMenuOptionBuilder()
        .setLabel(label)
        .setValue(value)
      if (value === arg) menu.setDefault(true)
      options.push(menu)
    }
    const label = level ? 'Constellation ' + level : 'All Constellations'
    res.components = [
      new StringSelectMenuBuilder()
        .setCustomId(`${slashcommand.name} char ${id} ${arg} ${lang} 1`)
        .setPlaceholder(label)
        .addOptions(options),
    ]
  } else throw 'Invalid talent name.'

  return res
}

function getAssets(id: CharacterSheetKey) {
  if (id.includes('Traveler')) {
    id = 'Traveler' + id.charAt(id.length - 1)
  }
  return AssetData.chars[id as LocationGenderedCharacterKey]
}

function getName(id: CharacterSheetKey, lang: string) {
  return translate(`charNames_gen`, id, lang)
}

function baseEmbed(id: CharacterSheetKey, lang: string) {
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

//get scalings
function talentFields(
  namespace: string,
  skill: string,
  params: number[][],
  level: number,
  lang: string
) {
  const scalings = Object.fromEntries(
    params.map((hit, i) => [i, hit[level - 1]])
  )
  let text = ''
  let val = ''
  for (const index in scalings) {
    text += translate(namespace, `${skill}.skillParams.${index}`, lang) + '\n'
    val +=
      translate(
        namespace,
        `${skill}.skillParamsEncoding.${index}`,
        lang,
        false,
        scalings
      ) + '\n'
  }

  //format to inline embed fields
  return [
    {
      name: ' ',
      value: clean(text),
      inline: true,
    },
    {
      name: ' ',
      value: clean(val),
      inline: true,
    },
  ]
}

function profileEmbed(id: CharacterSheetKey, namespace: string, lang: string) {
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
    '\n*-# ' +
    i18nInstance
      .t(
        [
          `${namespace}:description`,
          'A traveler from another world who had their only kin taken away, forcing them to embark on a journey to find The Seven.',
        ],
        { lng: lang }
      )
      .trim()
      .replaceAll('\n', '\n-# ') +
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

function normalsEmbed(
  id: CharacterSheetKey,
  namespace: string,
  level: number,
  lang: string
) {
  const auto = translate(namespace, 'auto', lang, true)
  const weapon = getCharStat(sheetKeyToCharKey(id)).weaponType
  const scalings = talentFields(
    namespace,
    'auto',
    getCharParam(id).auto,
    level,
    lang
  )
  //make embed
  return baseEmbed(id, lang)
    .setTitle(auto.name)
    .setDescription(
      clean(
        auto.upgradedFields
          ? Object.values(auto.upgradedFields.normal).join('\n') +
              '\n\n' +
              Object.values(auto.upgradedFields.charged).join('\n') +
              '\n\n' +
              Object.values(auto.upgradedFields.plunging).join('\n') +
              '\n\n' +
              (auto.upgradedFields.hexerei
                ? Object.values(auto.upgradedFields.hexerei).join('\n') + '\n\n'
                : '')
          : Object.values(auto.fields.normal).join('\n') +
              '\n\n' +
              Object.values(auto.fields.charged).join('\n') +
              '\n\n' +
              Object.values(auto.fields.plunging).join('\n') +
              '\n\n'
      )
    )
    .setThumbnail(giURL(CommonAssetData.normalIcons[weapon]))
    .addFields(scalings)
}

function skillEmbed(
  id: CharacterSheetKey,
  namespace: string,
  level: number,
  lang: string
) {
  const skill = translate(namespace, 'skill', lang, true)
  const scalings = talentFields(
    namespace,
    'skill',
    getCharParam(id).skill,
    level,
    lang
  )
  const embed = baseEmbed(id, lang)
    .setTitle(skill.name)
    .setDescription(clean(Object.values(skill.description).flat().join('\n')))
    .addFields(scalings)
  const thumbnail = getAssets(id).skill
  if (thumbnail) embed.setThumbnail(giURL(thumbnail))

  return embed
}

function burstEmbed(
  id: CharacterSheetKey,
  namespace: string,
  level: number,
  lang: string
) {
  const burst = translate(namespace, 'burst', lang, true)
  const scalings = talentFields(
    namespace,
    'burst',
    getCharParam(id).burst,
    level,
    lang
  )
  const embed = baseEmbed(id, lang)
    .setTitle(burst.name)
    .setDescription(clean(Object.values(burst.description).flat().join('\n')))
    .addFields(scalings)
  const thumbnail = getAssets(id).burst
  if (thumbnail) embed.setThumbnail(giURL(thumbnail))
  return embed
}

type Passives =
   | 'passive1'
   | 'passive2'
   | 'passive3'
   | 'passive'
   | 'lockedPassive'
function selectPassive(p: number): Passives[] {
  if (p) {
    if (p === 1) return ['passive1']
    if (p === 4) return ['passive2']
  }
  return ['passive1', 'passive2', 'passive3', 'passive', 'lockedPassive']
}

function passivesEmbed(
  id: CharacterSheetKey,
  namespace: string,
  level: number,
  lang: string
) {
  let text = ''
  //select passives
  const showPassives = selectPassive(level)
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
  id: CharacterSheetKey,
  namespace: string,
  level: number,
  lang: string
) {
  let text = ''
  //select constellations
  const allCons = ['1', '2', '3', '4', '5', '6'] as const
  if (level < 1 || level > 6) throw 'Invalid constellation.'
  const showCons = level ? [allCons[level - 1]] : allCons
  for (const constellationId of showCons) {
    const constellation = translate(
      namespace,
      `constellation${constellationId}`,
      lang,
      true
    )
    text += `**C${constellationId}: ${constellation.name}**\n`

    //hexerei upgrade
    if (constellation.upgradedDescription)
      text +=
        Object.values(constellation.upgradedDescription).flat().join('\n') +
        '\n\n'
    else
      text +=
        Object.values(constellation.description).flat().join('\n') + '\n\n'
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
  id: CharacterSheetKey,
  arg: string,
  lang: string
) {
  const namespace = `char_${id}_gen`
  await i18nInstance.loadNamespaces(namespace)
  const res = getEmbed(id, namespace, arg, lang)

  //create dropdown menu
  const options = []
  for (const talent of Object.values(talentlist)) {
    const menu = new StringSelectMenuOptionBuilder()
      .setLabel(talent.name)
      .setValue(talent.value)
    if (talent.value === arg[0]) menu.setDefault(true)
    options.push(menu)
  }
  const components = [
    new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`${slashcommand.name} char ${id} ${arg} ${lang} 0`)
        .setPlaceholder(talentlist[arg[0] as keyof typeof talentlist].name)
        .addOptions(options)
    ),
  ]
  for (const component of res.components)
    components.push(new ActionRowBuilder().addComponents(component))

  return {
    content: '',
    embeds: [res.embed],
    components: components,
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

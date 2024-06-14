import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import type { Interaction, MessageActionRowComponentBuilder } from 'discord.js'
import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import { clean, colors, talentlist } from '../archive'

function profileEmbed(embed: EmbedBuilder, name: string, data: any) {
  const text = data.description ??
  'A traveler from another world who had their only kin taken away, forcing them to embark on a journey to find The Seven.'
  if (data.title) embed.setTitle(data.title)
  embed.setDescription(clean(text))
  return embed
}

function normalsEmbed(embed: EmbedBuilder, name: string, data: any) {
  embed
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
  return embed
}

function skillEmbed(embed: EmbedBuilder, name: string, data: any) {
  embed
  .setTitle(data.skill.name)
  .setDescription(
    clean(Object.values(data.skill.description).flat().join('\n'))
  )
  return embed
}

function burstEmbed(embed: EmbedBuilder, name: string, data: any) {
  embed
  .setTitle(data.burst.name)
  .setDescription(
    clean(Object.values(data.burst.description).flat().join('\n'))
  )
  return embed
}

function passivesEmbed(embed: EmbedBuilder, name: string, data: any, talent: string) {
  let text = ''
  //list all passives
  let list = Object.keys(data).filter((e) => e.startsWith('passive'))
  //input to select a passive
  if (talent.length > 1) {
    if (talent[1] === '1') list = ['passive1']
    else if (talent[1] === '4') list = ['passive2']
    else list = list.slice(2)
  }
  //make embed
  for (const passive of list) {
    const e = data[passive]
    //ascension 1
    if (passive === 'passive1') text += `**${e.name}** (A1)\n`
    //ascension 4
    else if (passive === 'passive2') text += `**${e.name}** (A4)\n`
    //innate passives
    else text += `**${e.name}** \n`
    text += Object.values(e.description).flat().join('\n') + '\n\n'
  }
  embed.setDescription(clean(text))
  return embed
}

function constellationsEmbed(embed: EmbedBuilder, name: string, data: any, talent: string) {
  let text = ''
  let arr = ['1', '2', '3', '4', '5', '6']
  if (talent.length > 1) arr = [talent[1]]
  for (const n of arr) {
    const e = data[`constellation${n}`]
    text +=
      `**${n}. ${e.name}** ` +
      Object.values(e.description).flat().join('\n') +
      '\n\n'
  }
  //make embed
  if (data.constellationName) embed.setTitle(data.constellationName)
  embed.setAuthor({ name: name }).setDescription(clean(text))
  return embed
}

export function chararchive(
  interaction: Interaction,
  id: CharacterKey,
  name: string,
  data: any,
  args: string
) {
  //get element
  const element = getCharEle(id)
  //setup embed
  let embed = new EmbedBuilder()
    .setFooter({
      text: 'Character Archive',
    })
    .setAuthor({
      name: name,
      iconURL: colors.element[element].img,
    })
    .setColor(colors.element[element].color)
  //set contents
  const talent = args

  //character profile
  if (talent === 'p') {
    embed = profileEmbed(embed, name, data)
  }
  //normal/charged/plunging attacks
  else if (talent === 'n') {
    embed = normalsEmbed(embed, name, data)
  }
  //elemental skill
  else if (talent === 'e') {
    embed = skillEmbed(embed, name, data)
  }
  //elemental burst
  else if (talent === 'q') {
    embed = burstEmbed(embed, name, data)
  }
  //passives
  else if (talent.match(/a\d?/)) {
    embed = passivesEmbed(embed, name, data, talent)
  }
  //constellations
  else if (talent.match(/c[123456]?/)) {
    embed = constellationsEmbed(embed, name, data, talent)
  }
  else throw 'Invalid talent name.'

  //create dropdown menu
  const options = []
  for (const t of Object.values(talentlist)) {
    const menu = new StringSelectMenuOptionBuilder()
      .setLabel(t.name)
      .setValue(t.value)
    if (t.value === talent[0]) menu.setDefault(true)
    options.push(menu)
  }
  const components = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`archive char ${id} ${talent}`)
      .setPlaceholder(talentlist[talent[0] as keyof typeof talentlist].name)
      .addOptions(options)
  ) as ActionRowBuilder<MessageActionRowComponentBuilder>

  return {
    content: '',
    embeds: [embed],
    components: [components],
  }
}

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

function baseEmbed(id: CharacterKey, name: string) {
  const element = getCharEle(id)
  return new EmbedBuilder()
    .setFooter({
      text: 'Character Archive',
    })
    .setAuthor({
      name: name,
      iconURL: colors.element[element].img,
    })
    .setColor(colors.element[element].color)
}

function profileEmbed(id: CharacterKey, name: string, data: any) {
  const text =
    data.description ??
    'A traveler from another world who had their only kin taken away, forcing them to embark on a journey to find The Seven.'
  const embed = baseEmbed(id, name)
  if (data.title) embed.setTitle(data.title)
  embed.setDescription(clean(text))
  return embed
}

function normalsEmbed(id: CharacterKey, name: string, data: any) {
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
}

function skillEmbed(id: CharacterKey, name: string, data: any) {
  return baseEmbed(id, name)
    .setTitle(data.skill.name)
    .setDescription(
      clean(Object.values(data.skill.description).flat().join('\n'))
    )
}

function burstEmbed(id: CharacterKey, name: string, data: any) {
  return baseEmbed(id, name)
    .setTitle(data.burst.name)
    .setDescription(
      clean(Object.values(data.burst.description).flat().join('\n'))
    )
}

function passivesEmbed(
  id: CharacterKey,
  name: string,
  data: any,
  talent: string
) {
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
  return baseEmbed(id, name).setDescription(clean(text))
}

function constellationsEmbed(
  id: CharacterKey,
  name: string,
  data: any,
  talent: string
) {
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
  const embed = baseEmbed(id, name)
  if (data.constellationName) embed.setTitle(data.constellationName)
  embed.setDescription(clean(text))
  return embed
}

export function chararchive(
  interaction: Interaction,
  id: CharacterKey,
  name: string,
  data: any,
  args: string
) {
  const talent = args
  const embed = getEmbed(id, name, data, talent)

  //create dropdown menu
  const options = []
  for (const t of Object.values(talentlist)) {
    const menu = new StringSelectMenuOptionBuilder()
      .setLabel(t.name)
      .setValue(t.value)
    if (t.value === talent) menu.setDefault(true)
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

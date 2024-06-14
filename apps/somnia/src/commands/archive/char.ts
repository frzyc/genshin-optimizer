import type {
  CharacterKey,
  ElementKey,
} from '@genshin-optimizer/gi/consts'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import type { Interaction, MessageActionRowComponentBuilder } from 'discord.js'
import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import { clean, colors, talentlist } from '../archive'



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
  const embed = new EmbedBuilder()
    .setFooter({
      text: 'Character Archive',
    })
    .setAuthor({
      name: name,
      iconURL: colors.element[element].img,
    })
    .setColor(colors.element[element].color)
  //set contents
  let text = ''
  const talent = args

  //character profile
  if (talent === 'p') {
    text =
      data.description ??
      'A traveler from another world who had their only kin taken away, forcing them to embark on a journey to find The Seven.'
    if (data.title) embed.setTitle(data.title)
    embed.setDescription(clean(text))
  }
  //normal/charged/plunging attacks
  else if (talent === 'n') {
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
  }
  //elemental skill
  else if (talent === 'e') {
    embed
      .setTitle(data.skill.name)
      .setDescription(
        clean(Object.values(data.skill.description).flat().join('\n'))
      )
  }
  //elemental burst
  else if (talent === 'q') {
    embed
      .setTitle(data.burst.name)
      .setDescription(
        clean(Object.values(data.burst.description).flat().join('\n'))
      )
  }
  //passives
  else if (talent.match(/a\d?/)) {
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
  }
  //constellations
  else if (talent.match(/c[123456]?/)) {
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
  } else throw 'Invalid talent name.'

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
      .setCustomId(`archive char ${id} ${args}`)
      .setPlaceholder(talentlist[args as keyof typeof talentlist].name)
      .addOptions(options)
  ) as ActionRowBuilder<MessageActionRowComponentBuilder>

  return {
    content: '',
    embeds: [embed],
    components: [components],
  }
}

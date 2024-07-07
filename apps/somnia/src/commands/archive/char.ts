import type { CharacterKey, LocationGenderedCharacterKey, TravelerKey } from '@genshin-optimizer/gi/consts'
import { getCharEle, getCharStat } from '@genshin-optimizer/gi/stats'
import { AssetData } from '@genshin-optimizer/gi/assets-data'
import type { Interaction, MessageActionRowComponentBuilder } from 'discord.js'
import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import { clean, talentlist } from '../archive'
import { elementAssets } from '../../assets/assets'

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

function getassets(id: CharacterKey) {
  let genderedid : LocationGenderedCharacterKey | TravelerKey = id;
  if (id.includes('Traveler')) {
    if (Math.random() < 0.5)
      genderedid = 'TravelerM'
    else
      genderedid = 'TravelerF'
  }
  return AssetData.chars[genderedid]
}

function baseEmbed(id: CharacterKey, name: string) {
  const element = getCharEle(id)
  return new EmbedBuilder()
    .setFooter({
      text: 'Character Archive',
    })
    .setAuthor({
      name: name,
      iconURL: `https://api.ambr.top/assets/UI/${getassets(id).icon}.png`,
    })
    .setColor(elementAssets[element].color)
}

function profileEmbed(id: CharacterKey, name: string, data: any) {
  const element = getCharEle(id)
  const text =
    data.description ??
    'A traveler from another world who had their only kin taken away, forcing them to embark on a journey to find The Seven.'
  const embed = baseEmbed(id, name)
  if (data.title) embed.setTitle(data.title)
  return embed
    .setAuthor({
      name: name,
      iconURL: elementAssets[element].img,
    })
    .setThumbnail(`https://api.ambr.top/assets/UI/${getassets(id).icon}.png`)
    .setDescription(clean(text))
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
    .setThumbnail(`https://api.ambr.top/assets/UI/${AssetData.normalIcons[weapon]}.png`)
}

function skillEmbed(id: CharacterKey, name: string, data: any) {
  return baseEmbed(id, name)
    .setTitle(data.skill.name)
    .setDescription(
      clean(Object.values(data.skill.description).flat().join('\n'))
    )
    .setThumbnail(`https://api.ambr.top/assets/UI/${getassets(id).skill}.png`)
}

function burstEmbed(id: CharacterKey, name: string, data: any) {
  return baseEmbed(id, name)
    .setTitle(data.burst.name)
    .setDescription(
      clean(Object.values(data.burst.description).flat().join('\n'))
    )
    .setThumbnail(`https://api.ambr.top/assets/UI/${getassets(id).burst}.png`)
}

function passivesEmbed(
  id: CharacterKey,
  name: string,
  data: any,
  talent: string
) {
  let text = ''
  //list all passives
  let list = Object.keys(data).filter((e) => e.startsWith('passive')) as ('passive1' | 'passive2' | 'passive3' | 'passive')[]
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
  return baseEmbed(id, name)
    .setDescription(clean(text))
    .setThumbnail(`https://api.ambr.top/assets/UI/${getassets(id)[list[0]]}.png`)
}

function constellationsEmbed(
  id: CharacterKey,
  name: string,
  data: any,
  talent: string
) {
  let text = ''
  let list = ['1', '2', '3', '4', '5', '6']
  if (talent.length > 1 && talent[1] in list) list = [talent[1]]
  for (const n of list) {
    const e = data[`constellation${n}`]
    text +=
      `**${n}. ${e.name}** ` +
      Object.values(e.description).flat().join('\n') +
      '\n\n'
  }
  const thumbid = `constellation${list[0]}` as 'constellation1' | 'constellation2' | 'constellation3' | 'constellation4' | 'constellation5' | 'constellation6'
  //make embed
  const embed = baseEmbed(id, name)
  if (data.constellationName) embed.setTitle(data.constellationName)
  return embed
    .setDescription(clean(text))
    .setThumbnail(`https://api.ambr.top/assets/UI/${getassets(id)[thumbid]}.png`)
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

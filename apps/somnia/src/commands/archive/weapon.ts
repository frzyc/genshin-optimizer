import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { Interaction, MessageActionRowComponentBuilder } from 'discord.js'
import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import { clean, colors } from '../archive'
import { range } from '@genshin-optimizer/common/util'

const refinedisplay : Record<string, string> = {0: '1', 1: '2', 2: '3', 3: '4', 4: '5'}

export function weaponarchive(
  interaction: Interaction,
  id: WeaponKey,
  name: string,
  data: any,
  args: string
) {
  const msg: any = {}
  name = data.name
  let text = Object.values(data.description).join('\n')
  //weapon rarity color
  const rarity = allStats.weapon.data[id].rarity
  //default r1 5stars
  let refine = '0'
  //no refinements or dropdown for 1/2 star weapons
  if (rarity > 2) {
    //r5 for 3/4 star weapons
    if (rarity < 5) refine = '4'
    //user input override
    if (args in refinedisplay) refine = args
    else throw 'invalid refine'
    name += ` (R${refinedisplay[refine]})`
    //create dropdown menu
    const options: StringSelectMenuOptionBuilder[] = []
    range(1, 5).forEach(i => {
      const r = String(i-1)
      const option = new StringSelectMenuOptionBuilder()
        .setLabel(`Refinement ${i}`)
        .setValue(r)
      if (refine === r) option.setDefault(true)
      options.push(option)
    })
    msg['components'] = [
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`archive weapon ${id} ${refine}`)
          .setPlaceholder(`Refinement ${refine}`)
          .addOptions(options)
      ) as ActionRowBuilder<MessageActionRowComponentBuilder>,
    ]
    text +=
      `\n\n**${data.passiveName}:** ` +
      Object.values(
        data.passiveDescription[refine]
      ).join('\n')
  }
  //set content
  msg['embeds'] = [
    new EmbedBuilder()
      .setTitle(name)
      .setColor(colors.rarity[rarity - 1])
      .setFooter({
        text: 'Weapon Archive',
      })
      .setDescription(clean(text)),
  ]
  return msg
}

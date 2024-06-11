import type { Interaction, MessageActionRowComponentBuilder } from 'discord.js'
import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import type { archiveargs } from '../archive'
import { allStat_gen, clean, colors } from '../archive'

export function weaponarchive(
  interaction: Interaction,
  id: string,
  name: string,
  data: any,
  args: archiveargs
) {
  const msg: any = {}
  name = data.name
  let text = Object.values(data.description).join('\n')
  //weapon rarity color
  const rarity = allStat_gen.weapon.data[id].rarity
  //default r1 5stars and r5 others
  let refine = 1
  //no refinements for 1/2 star weapons
  if (rarity > 2) {
    //r5 for 3/4 star weapons
    refine = 5
    //r1 for 5 star weapons
    if (rarity > 4) refine = 1
    //user input override
    refine = args.refine ?? refine
    name += ` (R${refine})`
    //create dropdown menu
    msg['components'] = [
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`archive weapon ${id} ${refine}`)
          .setPlaceholder(`Refinement ${refine}`)
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel('Refinement 1')
              .setValue('1'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Refinement 2')
              .setValue('2'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Refinement 3')
              .setValue('3'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Refinement 4')
              .setValue('4'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Refinement 5')
              .setValue('5')
          )
      ) as ActionRowBuilder<MessageActionRowComponentBuilder>,
    ]
    text +=
      `\n\n**${data.passiveName}:** ` +
      Object.values(data.passiveDescription[(refine - 1).toString()]).join('\n')
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

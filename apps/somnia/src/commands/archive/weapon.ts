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
  //default r1 5stars and r5 others
  let refine = '1'
  //no refinements or dropdown for 1/2 star weapons
  if (rarity > 2) {
    //r1 for 5 star weapons
    if (rarity > 4) refine = '1'
    //r5 for 3/4 star weapons
    else refine = '5'
    //user input override
    if (args) refine = args
    name += ` (R${refine})`
    //create dropdown menu
    const options: StringSelectMenuOptionBuilder[] = []
    range(1, 5).forEach(i => {
      const r = String(i)
      const option = new StringSelectMenuOptionBuilder()
        .setLabel(`Refinement ${r}`)
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
        data.passiveDescription[String.fromCharCode(refine.charCodeAt(0) - 1)]
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

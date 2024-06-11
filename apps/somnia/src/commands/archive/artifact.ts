import type { Interaction } from 'discord.js'
import { EmbedBuilder } from 'discord.js'
import { allStat_gen, clean, colors } from '../archive'

export function artifactarchive(
  interaction: Interaction,
  id: string,
  name: string,
  data: any
) {
  //artifact rarity color
  const rarities = allStat_gen.art.data[id].rarities
  const rarity = rarities[rarities.length - 1]
  //set content
  let text = ''
  for (const e in data.setEffects) {
    if (e === '1') text += '**1-Piece:** '
    else text += `**${e}-Pieces** `
    text += `${data.setEffects[e]}\n`
  }
  const embed = new EmbedBuilder()
    .setTitle(data.setName)
    .setColor(colors.rarity[rarity - 1])
    .setFooter({
      text: 'Artifact Archive',
    })
    .setDescription(clean(text))

  return {
    content: '',
    embeds: [embed],
  }
}

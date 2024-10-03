import { AssetData } from '@genshin-optimizer/gi/assets-data'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { i18nInstance } from '@genshin-optimizer/gi/i18n-node'
import { getArtSetStat } from '@genshin-optimizer/gi/stats'
import { EmbedBuilder } from 'discord.js'
import { rarityColors } from '../../assets/assets'
import { giURL } from '../../lib/util'
import { clean, translate } from '../archive'

export async function artifactArchive(id: ArtifactSetKey, lang: string) {
  //artifact rarity color
  const rarities = getArtSetStat(id).rarities
  const rarity = rarities[rarities.length - 1]
  //set content
  const namespace = `artifact_${id}_gen`
  await i18nInstance.loadNamespaces(namespace)
  let text = ''
  const setEffects = translate(namespace, 'setEffects', lang, true)
  for (const e in setEffects) {
    if (e === '1') text += '**1-Piece:** '
    else text += `**${e}-Pieces:** `
    text += `${setEffects[e]}\n`
  }
  const embed = new EmbedBuilder()
    .setTitle(translate(namespace, 'setName', lang))
    .setColor(rarityColors[rarity - 1])
    .setFooter({
      text: 'Artifact Archive',
    })
    .setDescription(clean(text))
  const thumbnail =
    AssetData.artifacts[id].flower ?? AssetData.artifacts[id].circlet
  if (thumbnail) embed.setThumbnail(giURL(thumbnail, 'reliquary'))

  return {
    content: '',
    embeds: [embed],
  }
}

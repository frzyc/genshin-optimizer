import { range } from '@genshin-optimizer/common/util'
import { AssetData } from '@genshin-optimizer/gi/assets-data'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { i18nInstance } from '@genshin-optimizer/gi/i18n-node'
import { allStats, getWeaponStat } from '@genshin-optimizer/gi/stats'
import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import { rarityColors } from '../../assets/assets'
import { createAmbrUrl } from '../../lib/util'
import { clean, translate } from '../archive'

const refinedisplay: Record<string, string> = {
  0: '1',
  1: '2',
  2: '3',
  3: '4',
  4: '5',
}

function getDropdown(id: string, lang: string, refine: string) {
  const options: StringSelectMenuOptionBuilder[] = []
  range(1, 5).forEach((i) => {
    const r = String(i - 1)
    const option = new StringSelectMenuOptionBuilder()
      .setLabel(`Refinement ${i}`)
      .setValue(r)
    if (refine === r) option.setDefault(true)
    options.push(option)
  })
  return [
    new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`archive weapon ${id} ${lang} ${refine}`)
        .setPlaceholder(`Refinement ${refine}`)
        .addOptions(options)
    ),
  ]
}

export async function weaponArchive(id: WeaponKey, lang: string, args: string) {
  const namespace = `weapon_${id}_gen`
  await i18nInstance.loadNamespaces(namespace)
  const msg: any = {}
  let name: string = translate(namespace, 'name', lang)
  let text = ''
  const stat = getWeaponStat(id)
  //mainstat
  const ascension = stat.ascensionBonus[stat.mainStat.type] ?? [0]
  const mainstat = Math.round(
    stat.mainStat.base * allStats.weapon.expCurve[stat.mainStat.curve][90] + ascension[ascension.length - 1]
  ).toFixed(0) + ' ' + i18nInstance.t(`statKey_gen:${stat.mainStat.type}`)
  text += `## ${mainstat}`
  //substat
  if (stat.subStat) {
    let sub = stat.subStat.base * allStats.weapon.expCurve[stat.subStat.curve][90]
    const percent = stat.subStat.type.endsWith('_')
    if (percent) sub *= 100
    let substat = (Math.round(sub * 10) / 10).toFixed(1)
    if (percent) substat += '%'
    substat += ' ' + i18nInstance.t(`statKey_gen:${stat.subStat.type}`)
    text += `\n**${substat}**`
  }
  //default r1 5stars
  const rarity = stat.rarity
  let refine = '0'
  //no refinements or dropdown for 1/2 star weapons
  if (rarity > 2) {
    //r5 for 3/4 star weapons
    if (rarity < 5) refine = '4'
    //user input override
    if (args) refine = args
    //name and passive
    name += ` (R${refinedisplay[refine]})`
    text +=
      '\n\n**' +
      translate(namespace, 'passiveName') +
      ':** ' +
      Object.values(
        translate(namespace, `passiveDescription.${refine}`, lang, true)
      ).join('\n')
    //create dropdown menu
    msg['components'] = getDropdown(id, lang, refine)
  }
  //append lore text
  text +=
    '\n\n-# *' +
    Object.values(translate(namespace, 'description', lang, true)).join('\n') +
    '*'
  //set content
  msg['embeds'] = [
    new EmbedBuilder()
      .setTitle(name)
      .setColor(rarityColors[rarity - 1])
      .setFooter({
        text: 'Weapon Archive',
      })
      .setDescription(clean(text))
      .setThumbnail(createAmbrUrl(AssetData.weapons[id].icon)),
  ]
  return msg
}

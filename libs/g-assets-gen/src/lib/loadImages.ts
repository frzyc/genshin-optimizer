import { artifactPiecesData, avatarExcelConfigData, AvatarSkillDepotExcelConfigData, avatarSkillDepotExcelConfigData, avatarSkillExcelConfigData, avatarTalentExcelConfigData, DM2D_PATH, fetterCharacterCardExcelConfigData, materialExcelConfigData, proudSkillExcelConfigData, reliquarySetExcelConfigData, rewardExcelConfigData, weaponExcelConfigData } from '@genshin-optimizer/dm'
import { artifactIdMap, artifactSlotMap, characterIdMap, dumpFile, weaponIdMap } from '@genshin-optimizer/pipeline'
import { crawlObject, layeredAssignment } from '@genshin-optimizer/util'
import fs = require('fs')
import path = require("path")

export const PROJ_PATH = `${__dirname}/../../../../../libs/g-assets/src` as const

type CharacterIcon = {
  icon: string,
  iconSide: string,
  banner?: string,
  bar?: string
}
type CharacterIconData = { [key: string]: CharacterIcon }
//An object to store all the asset related data.
export const AssetData = {
  weapons: {},
  artifacts: {},
  chars: {} as CharacterIconData,
}

export default function loadImages() {
  const hasTexture2D = fs.existsSync(DM2D_PATH)
  if (!hasTexture2D) return console.log(`libs/dm/Texture2D does not exist, no assets will be copied.`)
  function copyFile(src, dest) {
    if (!fs.existsSync(src)) {
      console.warn("Cannot find file", src)
      return
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFile(src, dest, (err) => {
      if (err) console.error(err);
    });
  }

  // Get icons for each artifact piece
  Object.entries(reliquarySetExcelConfigData).forEach(([setId, data]) => {
    const { EquipAffixId, containsList } = data
    if (!EquipAffixId) return

    const pieces = Object.fromEntries(containsList.map(pieceId => {
      const pieceData = artifactPiecesData[pieceId]
      if (!pieceData) throw `No piece data with id ${pieceId} in setId ${setId}`
      const { icon, equipType } = pieceData
      return [artifactSlotMap[equipType], icon]
    }))

    AssetData.artifacts[artifactIdMap[setId]] = pieces
  })

  // Get the icon/awakened for each weapon
  Object.entries(weaponExcelConfigData).forEach(([weaponid, weaponData]) => {
    const { icon, awakenIcon } = weaponData
    AssetData.weapons[weaponIdMap[weaponid]] = {
      icon,
      awakenIcon
    }
  })

  // parse baseStat/ascension/basic data for characters.
  Object.entries(avatarExcelConfigData).forEach(([charid, charData]) => {
    const { iconName, sideIconName } = charData

    let banner, bar;
    if (fetterCharacterCardExcelConfigData[charid]) {
      const { rewardId } = fetterCharacterCardExcelConfigData[charid]
      const { rewardItemList } = rewardExcelConfigData[rewardId]
      const { itemId } = rewardItemList[0];
      ({ picPath: [bar, banner] } = materialExcelConfigData[itemId]);
    }
    const assets = banner ? {
      icon: iconName,
      iconSide: sideIconName,
      banner,
      bar
    } : {
      icon: iconName,
      iconSide: sideIconName,
    }
    AssetData.chars[characterIdMap[charid]] = assets
  })

  const assetChar = AssetData.chars
  Object.entries(avatarExcelConfigData).forEach(([charid, charData]) => {
    const { iconName, sideIconName, skillDepotId, candSkillDepotIds } = charData

    const cKey = characterIdMap[charid]
    layeredAssignment(assetChar, [cKey, "icon"], iconName)
    layeredAssignment(assetChar, [cKey, "iconSide"], sideIconName)

    if (fetterCharacterCardExcelConfigData[charid]) {
      const { rewardId } = fetterCharacterCardExcelConfigData[charid]
      const { rewardItemList } = rewardExcelConfigData[rewardId]
      const { itemId } = rewardItemList[0];
      const { picPath: [bar, banner] } = materialExcelConfigData[itemId];
      bar && layeredAssignment(assetChar, [cKey, "bar"], bar)
      banner && layeredAssignment(assetChar, [cKey, "banner"], banner)
    }
    function genTalentHash(ck: string, depot: AvatarSkillDepotExcelConfigData) {
      const { energySkill: burst, skills: [normal, skill, sprint], talents, inherentProudSkillOpens: [passive1, passive2, passive3, , passive] } = depot

      // auto icons are shared.
      // layeredAssignment(characterAssetDump, [cKey, "auto"], talents[normal].skillIcon)
      layeredAssignment(assetChar, [ck, "skill"], avatarSkillExcelConfigData[skill].skillIcon)

      // burst has a more detailed _HD version
      layeredAssignment(assetChar, [ck, "burst"], avatarSkillExcelConfigData[burst].skillIcon + "_HD")
      if (sprint)
        layeredAssignment(assetChar, [ck, "sprint"], avatarSkillExcelConfigData[sprint].skillIcon)

      passive1.proudSkillGroupId && layeredAssignment(assetChar, [ck, "passive1"], proudSkillExcelConfigData[passive1.proudSkillGroupId][0].icon)
      passive2.proudSkillGroupId && layeredAssignment(assetChar, [ck, "passive2"], proudSkillExcelConfigData[passive2.proudSkillGroupId][0].icon)
      if (passive3?.proudSkillGroupId)
        layeredAssignment(assetChar, [ck, "passive3"], proudSkillExcelConfigData[passive3.proudSkillGroupId][0].icon)

      // Seems to be only used by SangonomiyaKokomi
      if (passive?.proudSkillGroupId)
        layeredAssignment(assetChar, [ck, "passive"], proudSkillExcelConfigData[passive.proudSkillGroupId][0].icon)

      talents.forEach((skId, i) => {
        layeredAssignment(assetChar, [ck, `constellation${i + 1}`], avatarTalentExcelConfigData[skId].icon)
      })
    }

    if (candSkillDepotIds.length) { // Traveler
      const [, , , anemo, , geo, electro, dendro] = candSkillDepotIds
      // const gender = characterIdMap[charid] === "TravelerF" ? "F" : "M"
      genTalentHash("TravelerAnemo", avatarSkillDepotExcelConfigData[anemo])
      genTalentHash("TravelerGeo", avatarSkillDepotExcelConfigData[geo])
      genTalentHash("TravelerElectro", avatarSkillDepotExcelConfigData[electro])
      genTalentHash("TravelerDendro", avatarSkillDepotExcelConfigData[dendro])
    } else {
      genTalentHash(cKey, avatarSkillDepotExcelConfigData[skillDepotId])
    }
  })
  // Dump out the asset List.
  dumpFile(`${__dirname}/AssetData_gen.json`, assetChar)
  crawlObject(AssetData, [], s => typeof s === "string", (icon, keys) => {
    copyFile(`${DM2D_PATH}/${icon}.png`, `${PROJ_PATH}/gen/${keys.slice(0, -1).join("/")}/${icon}.png`)
  })

  function crawlGen(obj, path) {
    const keys = Object.keys(obj)
    const isImg = typeof Object.values(obj)[0] === "string";
    // generate a index.ts using keys
    const indexContent = `// This is a generated index file.
${Object.entries(obj).map(([k, v]) => `import ${k} from "./${isImg ? `${v}.png` : k}"`).join("\n")}
const data = {
  ${keys.join(",\n  ")}
} as const
export default data
`
    fs.writeFileSync(`${path}/index.ts`, indexContent)

    Object.entries(obj).forEach(([key, val]) => {
      if (typeof val === "object")
        crawlGen(val, `${path}/${key}`)
    })
  }
  crawlGen(AssetData, `${PROJ_PATH}/gen`)
}

import { existsSync, readFileSync } from 'fs'
import { DM_PATH, HAKUSHIN_PATH } from './consts'

export function readExcelJSON(path: string) {
  const fullPath = `${DM_PATH}/${path}`
  if (!existsSync(fullPath)) throw `File not found :${fullPath}`
  return remap(JSON.parse(readFileSync(fullPath).toString()))
}

function remap(j: any): any {
  if (typeof j === 'object') {
    if (Array.isArray(j)) {
      return j.map(remap)
    } else {
      const r: any = {}
      for (const [k, v] of Object.entries(j)) {
        const x = remap(v)
        if (mapping[k]) {
          r[mapping[k]] = x
        } else {
          if (!missingKeys[k]) {
            missingKeys[k] = true
            console.error(`missing map for ${k}`)
          }
          r[k] = x
        }
      }
      return r
    }
  }
  return j
}

const missingKeys: Record<string, true> = {}

// biome-ignore format: generated
const mapping: Record<string, string> = {
...{"NEMBIFHOIKM": "affixId", "JIPJEMFCKAI": "openConfig", "BHFAPOEDIDB": "level", "PGEPICIANFN": "descTextMapHash", "CAAIICCCNKH": "paramList", "DNINKKHEILA": "nameTextMapHash", "ELKKIAIGOBK": "id"}, // 1 1 ExcelBinOutput/EquipAffixExcelConfigData.json
...{"HFBADPLCMHB": "propGrowCurves", "FOPPBECIFEK": "prefabPathRemoteHash", "EIAMEAIOIBB": "coopPicNameHash", "EJHEKGBABCM": "useType", "POMGFGAHIOJ": "bodyType", "FOCOLMLMEFN": "candSkillDepotIds", "JCHPBJLBEMK": "animatorConfigPathHash", "CGFBHNGBKEA": "prefabPathHash", "LFLDDANCFII": "controllerPathRemoteHash", "AIFOEHHCGBD": "critical", "PJEBBGHNICG": "defenseBase", "DBNGCFFLADA": "criticalHurt", "EPBNMHEIAPF": "imageName", "NNJHFOKAMHH": "avatarIdentityType", "JIEFGEDPAMG": "weaponType", "HCBILEOPKHD": "skillDepotId", "HALMHLCBJKM": "attackBase", "KKANFJILIHA": "manekinPathHash", "CCECCMBJPCM": "controllerPathHash", "CNFINPMELAA": "HOGEDCCNOJC", "FLPLGOODGNO": "initialWeapon", "OACLNIGCHAC": "isRangeAttack", "DNINKKHEILA": "nameTextMapHash", "OFEPGEKIJFA": "GNJHJGFINBA", "APNACLJKDEO": "avatarPromoteRewardIdList", "AHIADFJGCDC": "chargeEfficiency", "HLAEHIDCBHM": "gachaImageNameHash", "IPNPPIGGOPB": "sideIconName", "ADLDGBEKECJ": "qualityType", "OCNPJGGMLLO": "iconName", "CDJLGLIHLMC": "hpBase", "APHNFHKGLIK": "gachaCardNameHash", "PJGKNMIIDAM": "manekinMotionConfig", "ICIOFFFJHNJ": "avatarPromoteRewardLevelList", "OMLAABPDDIG": "deformationMeshPathHash", "OBPDLIMAFOO": "staminaRecoverSpeed", "GCPLLDFEEIL": "prefabPathRagdollHash", "NIMONFKGDBB": "specialDeformationMeshPathHash", "ECMKJJIDKAE": "avatarPromoteId", "MGNLPIJDIBD": "scriptDataPathHash", "LGIEHBJFJCM": "manekinJsonConfigHash"}, // 9 11 ExcelBinOutput/AvatarExcelConfigData.json
...{"PGEPICIANFN": "descTextMapHash", "DNINKKHEILA": "nameTextMapHash", "JIPJEMFCKAI": "openConfig", "EMEIMKNAIMF": "mainCostItemId", "CAAIICCCNKH": "paramList", "JKNPNKGCBCJ": "mainCostItemCount", "CNPCNIGHGJJ": "icon"}, // 3 3 ExcelBinOutput/AvatarTalentExcelConfigData.json
...{"PNKJCBDHHHP": "addProps", "HEGKMDJHGCI": "requiredPlayerLevel", "FLEHOIGKBPG": "scoinCost", "OJIICILLMLH": "unlockMaxLevel", "AKPHFJACMIB": "promoteLevel", "IGFEOKBEJCH": "costItems", "ECMKJJIDKAE": "avatarPromoteId"}, // 0 1 ExcelBinOutput/AvatarPromoteExcelConfigData.json
...{"CDKFLDLHCAD": "ILIINJLKPBD", "CBJGLADMBHG": "skills", "KFKBPILIJAH": "skillDepotAbilityGroup", "IAGMADCJGIA": "talents", "OEJNCGDIBID": "leaderTalent", "DPEHDGNEIDM": "inherentProudSkillOpens", "GIEFGHHKGDD": "energySkill", "IDLNEHLBGAJ": "talentStarName", "DPEGKJDJEPK": "subSkills", "NEMHOCMDGNM": "attackModeSkill", "ELKKIAIGOBK": "id"}, // 0 1 ExcelBinOutput/AvatarSkillDepotExcelConfigData.json
...{"PIAFGOEJILG": "infoBirthDay", "PCELBJNOMOL": "cvChineseTextMapHash", "LFGGMDLDCBN": "infoBirthMonth", "EKEBAJKDBDL": "avatarVisionAfterTextMapHash", "JJDAOIEBFGO": "cvKoreanTextMapHash", "JKBNGLFDMKI": "avatarConstellationBeforTextMapHash", "PINMEPJOJHK": "avatarTitleTextMapHash", "HLEAEKDHMOD": "avatarVisionBeforTextMapHash", "JPCEPOPKENF": "cvEnglishTextMapHash", "KJHOALFKIBH": "fetterId", "DEAKBHANNBE": "EBHPHHDNMOM", "KLMNPAIFFGH": "avatarDetailTextMapHash", "DDGIHKKKHDH": "finishConds", "DOIGBLABAHB": "avatarNativeTextMapHash", "FPKPDFANJHG": "avatarConstellationAfterTextMapHash", "JOPMLHJMAEN": "cvJapaneseTextMapHash", "OIMAMNIJEFL": "avatarAssocType", "JJMFCPHKOPD": "avatarId", "PHGPBGBKGIJ": "PJIIOILAEGO"}, // 0 1 ExcelBinOutput/FetterInfoExcelConfigData.json
...{"JICDGOLKLNC": "rewardId", "PPLILNEFOBN": "fetterLevel", "JJMFCPHKOPD": "avatarId"}, // 0 0 ExcelBinOutput/FetterCharacterCardExcelConfigData.json
...{"IGFEOKBEJCH": "costItems", "IGOGOJFLEAD": "coinCost", "PNKJCBDHHHP": "addProps", "FANMPMGMEFO": "lifeEffectType", "PGEPICIANFN": "descTextMapHash", "DNINKKHEILA": "nameTextMapHash", "OMJHAHCGNDD": "breakLevel", "DGIJCGLPDPI": "proudSkillGroupId", "LGMDLMMJCDA": "proudSkillType", "PFFEMAHALPG": "unlockDescTextMapHash", "CFHIEHNKDHL": "proudSkillId", "NNPPNFGNCMP": "lifeEffectParams", "OMJGEAHNBOA": "effectiveForTeam", "DFJLAINNBJP": "isHideLifeProudSkill", "JNGBMJKIIGC": "filterConds", "JIPJEMFCKAI": "openConfig", "CNPCNIGHGJJ": "icon", "IOLDHEOIPDP": "paramDescList", "CAAIICCCNKH": "paramList", "BHFAPOEDIDB": "level"}, // 0 0 ExcelBinOutput/ProudSkillExcelConfigData.json
...{"DJLJIGEAIHN": "playerExp", "FFDJPMHHGEB": "scoin", "KFIKAAFJCOG": "hcoin", "JICDGOLKLNC": "rewardId", "FDBIKNCLKAG": "rewardItemList"}, // 0 0 ExcelBinOutput/RewardExcelConfigData.json
...{"GAKPNNNEMDA": "curveInfos", "BHFAPOEDIDB": "level"}, // 0 0 ExcelBinOutput/AvatarCurveExcelConfigData.json
...{"MJJNIFIKOGN": "shareCDID", "HOKKCHGHHIM": "cdSlot", "PCKJKLEOBJG": "costElemVal", "PHGMFIGKKOH": "BNHEJBMOBLG", "IMEHCAJDFBJ": "maxChargeNum", "PNIDLNBBJIC": "costElemType", "OKBJBEMDFKD": "needMonitor", "LJGKGNKPBJG": "abilityName", "FABLEKJMNGA": "OBAFCGLGMAD", "OGMGGHKLNDF": "globalValueKey", "OLIBPDDKEKE": "triggerID", "DNINKKHEILA": "nameTextMapHash", "HLJIKICBNMC": "energyMin", "ELKKIAIGOBK": "id", "CJPNOJFOMLA": "cdTime", "CBKPEKJLAFP": "costStamina", "MBNEIMACIBM": "lockWeightParams", "DGIJCGLPDPI": "proudSkillGroupId", "HJJDKEEHANK": "dragType", "PKGHOMNHBIK": "ILBLBCFNPNP", "HCOKGNAJNFN": "buffIcon", "PGEPICIANFN": "descTextMapHash", "BGIHPNEDFOL": "skillIcon", "LNCNHHBDMIK": "lockShape"}, // 10 10 ExcelBinOutput/AvatarSkillExcelConfigData.json
...{"IBMLAJHHEGO": "flowerId", "IIIEFEKHAED": "sortOrder", "OKPKAMHJMJL": "leatherId", "BHFAPOEDIDB": "level", "HKJLKDJLKCB": "suitId", "AFDGJFKDNCJ": "id", "GJJMKFEIAND": "sandId", "KDGAHJAJAMB": "cupId", "KBCBHJGBHEJ": "capId"}, // 0 0 ExcelBinOutput/ReliquaryCodexExcelConfigData.json
...{"AGDCHCBAGFO": "propValue", "IFBOCDDOFJE": "depotId", "ELKKIAIGOBK": "id", "JJNPGPFNJHP": "propType", "KKJMBMPNPJH": "groupId"}, // 0 0 ExcelBinOutput/ReliquaryAffixExcelConfigData.json
...{"AIPPMEGLAKJ": "mainPropDepotId", "PKGAMPEIDDP": "appendPropNum", "FJJHHKBDGBF": "destroyReturnMaterial", "HMPDBGCJLMI": "rank", "GIFPAPLPMGO": "appendPropDepotId", "OBBFNHPMPDI": "weight", "ELKKIAIGOBK": "id", "AOBGMFDPCJG": "maxLevel", "NKFMKFHEIIP": "addPropLevels", "DNINKKHEILA": "nameTextMapHash", "FOPEFBACEOP": "gadgetId", "IMNCLIODOBL": "rankLevel", "CKGCIFHOIGE": "storyId", "CNPCNIGHGJJ": "icon", "PNDDLJILOCK": "showPic", "HNCDIADOINL": "equipType", "CEBMMGCMIJM": "itemType", "FAGPIACCGJE": "setId", "ILGGOAHIFJL": "baseConvExp", "PGEPICIANFN": "descTextMapHash", "PJELHADHEFE": "destroyRule", "GOCDANNHGIK": "dropable", "ECNHCKIACML": "destroyReturnMaterialCount"}, // 0 0 ExcelBinOutput/ReliquaryExcelConfigData.json
...{"HMPDBGCJLMI": "rank", "BNCJIKBPGNN": "exp", "BHFAPOEDIDB": "level", "PNKJCBDHHHP": "addProps"}, // 0 0 ExcelBinOutput/ReliquaryLevelExcelConfigData.json
...{"HDBBFMIDLPE": "EKBNEFGNCDP", "DAPKAPNJEAI": "setNeedNum", "ALEHMIINBPG": "containsList", "GGIFNFCHNPN": "setIcon", "FAGPIACCGJE": "setId", "NALHEHOJMJM": "textList", "MKODHDBFBDO": "equipAffixId", "HLCHLKECILA": "bagSortValue", "ACIMIKEFPAE": "disableFilter", "MBCPCJLIMJL": "dungeonGroup"}, // 0 0 ExcelBinOutput/ReliquarySetExcelConfigData.json
...{"CLNBABHDDPK": "effectGadgetID", "CEBMMGCMIJM": "itemType", "CJPNOJFOMLA": "cdTime", "HMPDBGCJLMI": "rank", "OPBNEJMJGEE": "satiationParams", "AKMJPFOPKGD": "BNPMJJNFHAJ", "KBLDOGNADDK": "specialDescTextMapHash", "BGFOCDKGNBH": "foodQuality", "LBNIBMAGAPC": "JGGGICECGIA", "PGEPICIANFN": "descTextMapHash", "OBBFNHPMPDI": "weight", "FOPEFBACEOP": "gadgetId", "IMNCLIODOBL": "rankLevel", "CNPCNIGHGJJ": "icon", "COJCDGNJELK": "setID", "DNINKKHEILA": "nameTextMapHash", "IHBBANAGAIA": "useLevel", "HBBILKOGMIP": "materialType", "MFDGAOECDFI": "typeDescTextMapHash", "JNGOAHDBKHI": "globalItemLimit", "OKNLEAMEKPD": "maxUseCount", "NICAFABHDPP": "cdGroup", "MJCAJBDFKCP": "useTarget", "PJELHADHEFE": "destroyRule", "ELKKIAIGOBK": "id", "IPMCELJMBFI": "interactionTitleTextMapHash", "PPCKMKGIIMP": "picPath", "FEEGIEEHGOM": "stackLimit", "ENALFMDBBOO": "effectName", "OENCEJFEFNH": "effectDescTextMapHash", "HKKOJBALCJE": "effectIcon"}, // 8 10 ExcelBinOutput/MaterialExcelConfigData.json
...{"ENICAFEAKBP": "maxProficiency", "BBHNMONLPKH": "cookMethod", "PGEPICIANFN": "descTextMapHash", "DNINKKHEILA": "nameTextMapHash", "CNPCNIGHGJJ": "icon", "EECPMDOLPIP": "effectDesc", "IGCJGPPAPJJ": "qteQualityWeightVec", "NOEHAAONHEH": "inputVec", "IMNCLIODOBL": "rankLevel", "IDCEJEOJAFI": "foodType", "ELKKIAIGOBK": "id", "FDFCPAIGCKO": "qualityOutputVec", "NODFCAAFBEJ": "qteParam", "FNFGAHPIPMH": "isDefaultUnlocked"}, // 0 0 ExcelBinOutput/CookRecipeExcelConfigData.json
...{"GAKPNNNEMDA": "curveInfos", "BHFAPOEDIDB": "level"}, // 0 0 ExcelBinOutput/WeaponCurveExcelConfigData.json
...{"FJJHHKBDGBF": "destroyReturnMaterial", "DNINKKHEILA": "nameTextMapHash", "APHNFHKGLIK": "gachaCardNameHash", "ONBFCEGNNFL": "unRotate", "CKGCIFHOIGE": "storyId", "CIOOHIIEJLK": "awakenCosts", "IMNCLIODOBL": "rankLevel", "HFHCFPFILAF": "awakenLightMapTexture", "PJELHADHEFE": "destroyRule", "PGEPICIANFN": "descTextMapHash", "ECNHCKIACML": "destroyReturnMaterialCount", "CNPCNIGHGJJ": "icon", "MIIFBCAILME": "skillAffix", "JDJMHFKKGHH": "awakenTexture", "KMOCENBGOEM": "awakenIcon", "OBBFNHPMPDI": "weight", "CEBMMGCMIJM": "itemType", "FDNEGCICNBJ": "weaponProp", "JIEFGEDPAMG": "weaponType", "FOPEFBACEOP": "gadgetId", "NMHNGBPGPIL": "awakenMaterial", "PGGBIAAPEKB": "weaponBaseExp", "HMPDBGCJLMI": "rank", "FBBLKIKOFMD": "enhanceRule", "BIJNJPAKLGP": "initialLockState"}, // 4 2 ExcelBinOutput/WeaponExcelConfigData.json
...{"PNKJCBDHHHP": "addProps", "DGMGGMHAGOA": "weaponPromoteId", "IGOGOJFLEAD": "coinCost", "AKPHFJACMIB": "promoteLevel", "IGFEOKBEJCH": "costItems", "HEGKMDJHGCI": "requiredPlayerLevel", "OJIICILLMLH": "unlockMaxLevel"}, // 0 0 ExcelBinOutput/WeaponPromoteExcelConfigData.json
"CMEOJJCIBDE": "value", "DELBOOLKFAO": "type", "IGIFKIGJHFB": "arith", "HKJMLLBFLOL": "count", "JBJFIDPCEAG": "growCurve", "JFALAEEKFMI": "talentId", "LLGCOHKLGGH": "initValue", "DDLIPFNCOMP": "itemCount", "JIOHEGJODPF": "itemId",
}

export function readTextmapJSON(path: string): Record<string, string> {
  const fullPath = `${DM_PATH}/${path}`
  if (!existsSync(fullPath)) throw `File not found :${fullPath}`
  return JSON.parse(readFileSync(fullPath).toString())
}

export function readHakushinJSON(path: string) {
  const fullPath = `${HAKUSHIN_PATH}/${path}`
  if (!existsSync(fullPath)) throw `File not found :${fullPath}`
  return readFileSync(fullPath).toString()
}

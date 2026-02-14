import { readDMJSON } from '../../util'

type HyperLinkNameExcelConifgData = {
  color: string // "7bb100",
  descParamList: string[] // ["4", "", "", "", ""]
  descTextMapHash: number // 1526174151,
  id: number // 210201,
  nameTextMapHash: number // 947913243
}

const hyperLinkNameExcelConifgDataSrc = JSON.parse(
  readDMJSON('ExcelBinOutput/HyperLinkNameExcelConifgData.json')
) as HyperLinkNameExcelConifgData[]

const hyperLinkNameExcelConifgData = {} as Record<
  string, // id
  HyperLinkNameExcelConifgData
>
hyperLinkNameExcelConifgDataSrc.forEach((data) => {
  const { id } = data
  hyperLinkNameExcelConifgData[id] = data
})

export { hyperLinkNameExcelConifgData }

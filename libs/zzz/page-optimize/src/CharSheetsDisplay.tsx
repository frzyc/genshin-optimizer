import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { Document } from '@genshin-optimizer/game-opt/sheet-ui'
import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import { useCharacterContext } from '@genshin-optimizer/zzz/db-ui'
import { Soldier0Anby, Yixuan } from '@genshin-optimizer/zzz/formula'
import { TagDisplay, charSheets } from '@genshin-optimizer/zzz/formula-ui'
import { Box } from '@mui/material'

export function CharSheetSection() {
  const { key: characterKey } = useCharacterContext()!
  return (
    <Box>
      {characterKey === 'Yixuan' && <MinimalYixuanSheet />}
      {characterKey === 'Soldier0Anby' && <MinimalS0AnbySheet />}
      {shouldShowDevComponents &&
        Object.values(charSheets[characterKey]).flatMap((sheet, index1) =>
          sheet.documents.map((doc, index2) => (
            <DocumentDisplay
              key={`${index1}_${index2}`}
              document={doc}
              collapse
            />
          ))
        )}
    </Box>
  )
}

const yixuanDocs: Document[] = [
  {
    type: 'text',
    text: "We automatically convert Yixuan's HP to Sheer Force at a ratio of 1:0.1. Everything else in her kit is not factored, such as the DMG Bonus % added in her Core skill",
  },
  {
    type: 'fields',
    fields: [
      {
        title: <TagDisplay tag={Yixuan.buffs.core_hpSheerForce.tag} />,
        fieldRef: Yixuan.buffs.core_hpSheerForce.tag,
      },
    ],
  },
]
function MinimalYixuanSheet() {
  return (
    <>
      {yixuanDocs.map((doc, index) => (
        <DocumentDisplay key={index} document={doc} />
      ))}
    </>
  )
}

const s0AnbyDocs: Document[] = [
  {
    type: 'text',
    text: "Enabling this checkbox will add additional CRIT DMG to Aftershock attacks, based on Soldier 0 - Anby's CRIT DMG, at a ratio matching her Core Skill level scaling. Everything else in her kit is not factored, such as the DMG Bonus % added in her Core skill for enemies marked with Silver Star.",
  },
  {
    type: 'conditional',
    conditional: {
      metadata: Soldier0Anby.conditionals.markedWithSilverStar,
      label: 'Enemy marked with Silver Star',
      fields: [
        {
          title: (
            <TagDisplay
              tag={Soldier0Anby.buffs.core_markedWithSilverStar_crit_dmg_.tag}
            />
          ),
          fieldRef: Soldier0Anby.buffs.core_markedWithSilverStar_crit_dmg_.tag,
        },
      ],
    },
  },
]
function MinimalS0AnbySheet() {
  return (
    <>
      {s0AnbyDocs.map((doc, index) => (
        <DocumentDisplay key={index} document={doc} />
      ))}
    </>
  )
}

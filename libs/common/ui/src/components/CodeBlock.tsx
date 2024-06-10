'use client'
import { Box, styled } from '@mui/material'

type LineNumberProps = {
  digits?: number
}
const LineNumber = styled('textarea')<LineNumberProps>(
  ({ theme, digits = 2 }) => ({
    width: `${digits}em`,
    overflow: 'hidden',
    userSelect: 'none',
    color: theme.palette.text.secondary,
    resize: 'none',
    border: 'none',
    whiteSpace: 'pre',
    fontFamily: 'monospace',
    lineHeight: 1,
    '&:disabled': {
      backgroundColor: 'transparent',
    },
  })
)

const CodeArea = styled('textarea')(({ theme }) => ({
  '&:disabled': {
    backgroundColor: 'transparent',
  },
  lineHeight: 1,
  width: '100%',
  overflowY: 'auto',
  overflowX: 'auto',
  fontFamily: 'monospace',
  border: 'none',
  // padding: 1em;
  whiteSpace: 'pre',
  backgroundColor: 'transparent',
  resize: 'none',
  color: theme.palette.info.light,
}))

export function CodeBlock({ text }: { text: string }) {
  const lines = text.split(/\r\n|\r|\n/).length + 1
  const lineNums = Array.from(Array(lines).keys())
    .map((i) => i + 1)
    .join('\n')

  return (
    <Box display="flex" flexDirection="row">
      <LineNumber
        disabled={true}
        spellCheck="false"
        aria-label="Code Sample"
        sx={{ height: `${lines + 1}em` }}
        value={lineNums}
        unselectable="on"
        digits={lines.toString().length}
      />
      <CodeArea
        sx={{ flexGrow: 1, height: `${lines + 1}em` }}
        disabled={true}
        spellCheck="false"
        aria-label="Code Sample"
        value={text}
      />
    </Box>
  )
}

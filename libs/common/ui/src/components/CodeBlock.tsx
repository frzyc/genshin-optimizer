'use client'
import { Box, styled } from '@mui/material'

const CodeArea = styled('code')(({ theme }) => ({
  '&:disabled': {
    backgroundColor: 'transparent',
  },
  lineHeight: 1,
  width: '100%',
  overflowY: 'auto',
  overflowX: 'auto',
  fontFamily: 'monospace',
  fontSize: '80%',
  border: 'none',
  padding: '1em',
  whiteSpace: 'pre-wrap',
  backgroundColor: 'transparent',
  resize: 'none',
  color: theme.palette.info.light,
  background: theme.palette.contentDark.main,
  'p::before': {
    content: 'counter(lineNumber)',
    width: '2.5em',
    textAlign: 'right',
    display: 'inline-block',
    paddingRight: '1em',
    opacity: 0.5,
    color: 'white',
  },
}))

export function CodeBlock({ text }: { text: string }) {
  const lines = text.split(/\r\n|\r|\n/)

  return (
    <Box display="flex" flexDirection="row" p={1}>
      <CodeArea spellCheck="false" aria-label="Code Sample">
        {lines.map((l, index) => {
          const numSpaces = l.search(/\S/)
          return (
            <p
              key={index}
              style={{
                counterIncrement: 'lineNumber',
                margin: 0,
                // Makes it so wrapped lines start with some amount of indentation
                paddingLeft: `${numSpaces * 7.5 + 20}px`,
                textIndent: `-${numSpaces * 7.5 + 20}px`,
              }}
            >
              {l}
            </p>
          )
        })}
      </CodeArea>
    </Box>
  )
}

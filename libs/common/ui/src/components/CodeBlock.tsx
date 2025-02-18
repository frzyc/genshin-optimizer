'use client'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Box, IconButton, styled } from '@mui/material'

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
  '.codeLine::before': {
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
    <Box display="flex" flexDirection="row" px={1} pb={1}>
      <CodeArea
        spellCheck="false"
        aria-label="Code Sample"
        sx={{ mt: 0, pt: 0 }}
      >
        <Box display="flex">
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            size="small"
            sx={{ opacity: 0.5, p: 0, mt: 1 }}
            onClick={() => navigator.clipboard.writeText(text)}
          >
            <ContentCopyIcon fontSize="inherit" />
          </IconButton>
        </Box>{' '}
        {lines.map((l, index) => {
          const numSpaces = l.search(/\S/)
          return (
            <span
              key={index}
              className="codeLine"
              style={{
                counterIncrement: 'lineNumber',
                margin: 0,
                display: 'block',
                // Makes it so wrapped lines start with some amount of indentation
                paddingLeft: `${numSpaces * 7.5 + 20}px`,
                textIndent: `-${numSpaces * 7.5 + 20}px`,
              }}
            >
              {l}
            </span>
          )
        })}
      </CodeArea>
    </Box>
  )
}

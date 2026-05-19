import type { OcrTextLine } from '@genshin-optimizer/zzz/disc-scanner'
import { Box, Stack, Typography } from '@mui/material'

export function ScanImagePreview({
  imageURL,
  imageWidth,
  imageHeight,
  ocrLines,
  alt,
}: {
  imageURL: string
  imageWidth: number
  imageHeight: number
  ocrLines: OcrTextLine[]
  alt?: string
}) {
  const strokeWidth = Math.max(1.5, imageWidth / 500)
  const wordStrokeWidth = Math.max(1, imageWidth / 700)

  return (
    <Stack spacing={1} alignItems="center" width="100%">
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 350,
          maxHeight: 1500,
          aspectRatio: `${imageWidth} / ${imageHeight}`,
        }}
      >
        <Box
          component="img"
          src={imageURL}
          alt={alt}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
        {ocrLines.length > 0 && (
          <Box
            component="svg"
            viewBox={`0 0 ${imageWidth} ${imageHeight}`}
            preserveAspectRatio="xMidYMid meet"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {ocrLines.map((line, lineIndex) => (
              <g key={`line-${lineIndex}-${line.text}`}>
                <rect
                  x={line.x}
                  y={line.y}
                  width={line.width}
                  height={line.height}
                  fill="rgba(76, 175, 80, 0.08)"
                  stroke="#4caf50"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${strokeWidth * 4} ${strokeWidth * 2}`}
                  vectorEffect="non-scaling-stroke"
                />
                {line.words.map((word, wordIndex) => (
                  <rect
                    key={`word-${lineIndex}-${wordIndex}-${word.text}`}
                    x={word.x}
                    y={word.y}
                    width={word.width}
                    height={word.height}
                    fill="rgba(129, 199, 132, 0.15)"
                    stroke="#a5d6a7"
                    strokeWidth={wordStrokeWidth}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </g>
            ))}
          </Box>
        )}
      </Box>
      {ocrLines.length > 0 && (
        <>
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1.5}
            justifyContent="center"
            sx={{ maxWidth: 350 }}
          >
            <Typography variant="caption" color="text.secondary">
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  width: 14,
                  height: 10,
                  border: `${strokeWidth}px dashed #4caf50`,
                  verticalAlign: 'middle',
                  mr: 0.5,
                }}
              />
              Line (incl. wrap)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  width: 14,
                  height: 10,
                  border: `${wordStrokeWidth}px solid #a5d6a7`,
                  verticalAlign: 'middle',
                  mr: 0.5,
                }}
              />
              Word
            </Typography>
          </Stack>
          <Stack spacing={0.25} sx={{ maxWidth: 350, width: '100%' }}>
            {ocrLines.map((line, index) => (
              <Typography
                key={`${index}-${line.text}`}
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: 'monospace', lineHeight: 1.3 }}
              >
                {line.text}
              </Typography>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  )
}

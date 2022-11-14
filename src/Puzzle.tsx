import { Box, Button, CardContent, CardHeader, Divider, Stack, Typography } from "@mui/material"
import CardLight from "./Components/Card/CardLight"
import ModalWrapper from "./Components/ModalWrapper"
import './Puzzle.scss'
import useForceUpdate from "./ReactHooks/useForceUpdate"

import { useState } from "react"
import { evtExcerpt, evtFoundTitle } from "./event"
import gan4joy from "./gan4joy.png"
import gan4joygif from "./gan4joygif.gif"

const c = `      FUNN1G4NYU`
function Grid({ grid, nightmare }: { grid: (number | null)[][], nightmare: boolean }) {
  const [, forceUpdate] = useForceUpdate()
  const completed = isCompleted(grid)
  return <Box>
    {grid.map((row, rowI) => (
      <div className="row" key={rowI}>
        {row.map((cell, cellI) => {
          let className = "cell";
          let onClick = undefined as any;
          const pattern = [rowI, cellI].join("|") as any;
          if (!completed && findPossibleMoves(grid).includes(pattern)) {
            className += " possible-move";
            onClick = e => {
              const direction = switchCell(grid, pattern);
              e.currentTarget.classList.add(`direction-${direction}`);
              e.currentTarget.classList.add(`direction`);
              setTimeout(forceUpdate, 200);
            };
          }
          if (cell === null) {
            if (!completed) {
              className += " empty";
            } else
              cell = 16
          }
          return (
            <Box key={cellI} onClick={onClick} className={className}
              sx={cell ? {
                color: "rgb(255,255,0)",
                textShadow: "0 0 10px black",
                backgroundImage: `url(${nightmare ? gan4joygif : gan4joy})`,
                backgroundPosition: `-${((cell - 1) % 4) * 50}px -${(Math.floor((cell - 1) / 4)) * 50}px`,
                backgroundSize: "200px 200px",
              } : undefined}>
              <strong>{completed ? c[(cell as any) - 1] : cell}</strong>
            </Box>
          );
        })}
      </div>
    ))}
  </Box>
}

function findPossibleMoves(grid): any {
  const [row, col] = findNullPosition(grid);
  const possibleMoves = [] as any[];
  if (grid[row - 1] !== undefined) {
    possibleMoves.push([row - 1, col].join("|"));
  }
  if (grid[row + 1] !== undefined) {
    possibleMoves.push([row + 1, col].join("|"));
  }
  if (grid[row][col - 1] !== undefined) {
    possibleMoves.push([row, col - 1].join("|"));
  }
  if (grid[row][col + 1] !== undefined) {
    possibleMoves.push([row, col + 1].join("|"));
  }
  return possibleMoves;
}

function isCompleted(grid) {
  return grid.every((row, rowI) =>
    row.every((cell, cellI) => {
      return cell === rowI * 4 + cellI + 1 || cell === null;
    })
  );
}

function findNullPosition(grid) {
  const row = grid.findIndex(r => r.includes(null));
  const col = grid[row].indexOf(null);
  return [row, col];
}

function switchCell(grid, cell) {
  const [nullX, nullY] = findNullPosition(grid);
  const [x, y] = cell.split("|");
  let direction = "e";
  if (x > nullX) {
    direction = "n";
  }
  if (x < nullX) {
    direction = "s";
  }
  if (y > nullY) {
    direction = "w";
  }
  [grid[nullX][nullY], grid[x][y]] = [grid[x][y], grid[nullX][nullY]];
  return direction;
}

function shuffle(n, grid) {
  let lastPosition = findNullPosition(grid).join("|");
  for (let i = 0; i < n; i++) {
    const moves = findPossibleMoves(grid);
    const removeIndex = moves.indexOf(lastPosition);
    moves.splice(removeIndex, 1);
    const randomIndex = parseInt((Math.random() * moves.length) as any, 10);
    const move = moves[randomIndex];
    lastPosition = findNullPosition(grid).join("|");
    switchCell(grid, move);
  }
}

const testGrid = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, null]
];

shuffle(100, testGrid);

export default function Puzzle({ show, onHide }) {
  const [nightmare, setNightmare] = useState(false)
  return <ModalWrapper containerProps={{ maxWidth: "sm" }} open={show} onClose={onHide}>
    <CardLight>
      <CardHeader title={evtFoundTitle} />
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          {evtExcerpt}
          <Typography><strong><code>:gan4joy:</code></strong></Typography>
          <Typography>Complete the puzzle to get the code:</Typography>
          <Grid grid={testGrid} nightmare={nightmare} />
          <Button fullWidth onClick={() => setNightmare(!nightmare)}>{nightmare ? "Easymode, please, I have a headache." : "I hate myself, give me hardmode."}</Button>
        </Stack>
      </CardContent>
    </CardLight>
  </ModalWrapper>
}

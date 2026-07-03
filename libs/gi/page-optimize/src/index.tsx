import { Route, Routes } from 'react-router-dom'
import { OptimizeEntry } from './OptimizeEntry'
import { OptimizeShell } from './OptimizeShell'

export default function PageOptimize() {
  return (
    <Routes>
      <Route index element={<OptimizeEntry />} />
      <Route path=":teamId/*" element={<OptimizeShell />} />
    </Routes>
  )
}

//small helper component to help display calculated values in weapon description text
export default function WeaponPercent(percent, value) {
  if (!percent || !value) return null
  return <span>(<span className="text-success">{(percent * value / 100).toFixed(1)}</span>)</span>
}
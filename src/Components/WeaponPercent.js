//small helper component to help display calculated values in weapon description text
//TODO rename this since this is used in more than weapons
export default function WeaponPercent(percent, value, fixed = 1) {
  if (!percent || !value) return null
  return <span>(<span className="text-success">{(percent * value / 100).toFixed(fixed)}</span>)</span>
}
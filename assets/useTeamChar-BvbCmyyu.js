import { a as useDatabase, fA as useDataManagerBase } from "./index-B8aczfSH.js";
function hexToColor(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result)
    return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}
function colorToRgbaString(color, alpha = 1) {
  if (!color)
    return;
  return `rgba(${color.r},${color.g},${color.b},${alpha})`;
}
function useTeamChar(teamCharId) {
  const database = useDatabase();
  return useDataManagerBase(database.teamChars, teamCharId);
}
export {
  colorToRgbaString as c,
  hexToColor as h,
  useTeamChar as u
};

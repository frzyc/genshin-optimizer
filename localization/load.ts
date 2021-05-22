const fs = require('fs')
//put all manual translation into one file.
const enDir = './Translated/'
const localeDir = '../public/locales/'
fs.readdir(enDir, (err, files) => {
  files = files.filter(fn => fn.includes(".json"))
  files.forEach(file => {
    const lang = file.split('.json')[0]
    const raw = fs.readFileSync(enDir + file)
    const json = JSON.parse(raw)
    Object.entries(json).forEach(([ns, entry]) => {
      const content = JSON.stringify(entry, null, 2)
      const fileDir = `${localeDir}${lang}`
      const fileName = `${fileDir}/${ns}.json`
      if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir)
      fs.writeFile(fileName, content, () => console.log("Generated JSON at", fileName));
    })
  });
});
export { }
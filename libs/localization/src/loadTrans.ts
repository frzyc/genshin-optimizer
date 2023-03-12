import fs = require('fs')
// Load translation files from POEditor into the assets folder.
const transDir = `${__dirname}/../Translated/`
const localeDir = `${__dirname}/../assets/locales/`
const logging = false
fs.readdir(transDir, (err, files) => {
  files = files.filter((fn) => fn.includes('.json'))
  files.forEach((file) => {
    const lang = file.split('.json')[0]
    const raw = fs.readFileSync(transDir + file).toString()
    const json = JSON.parse(raw)
    Object.entries(json).forEach(([ns, entry]) => {
      const content = JSON.stringify(entry, null, 2)
      const fileDir = `${localeDir}${lang}`
      const fileName = `${fileDir}/${ns}.json`
      if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir)
      fs.writeFile(
        fileName,
        content,
        () => logging && console.log('Generated JSON at', fileName)
      )
    })
  })
})

import fs = require('fs')
//put all manual(english) translation into one file, to upload to POEditor to update translations.
const enDir = `${__dirname}/../assets/locales/en/`
fs.readdir(enDir, (err, files) => {
  const main = {} as { [key: string]: object }
  files = files.filter((fn) => fn.includes('.json') && !fn.includes('_gen'))
  files.forEach((file) => {
    const filename = file.split('.json')[0]
    const raw = fs.readFileSync(enDir + file).toString()
    const json = JSON.parse(raw)
    main[filename] = json
  })
  const data = JSON.stringify(main, null, 2)
  const mainFile = `${__dirname}/../main_gen.json`
  fs.writeFileSync(mainFile, data)
  console.log('Generated MAIN JSON at ', mainFile)
})

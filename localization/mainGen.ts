const fs = require('fs')
//put all manual translation into one file.
const enDir = '../public/locales/en/'
fs.readdir(enDir, (err, files) => {
  const main = {}
  files = files.filter(fn => fn.includes(".json") && !fn.includes('_gen'))
  files.forEach(file => {
    const filename = file.split('.json')[0]
    const raw = fs.readFileSync(enDir + file)
    const json = JSON.parse(raw)
    main[filename] = json
  });
  const data = JSON.stringify(main, null, 2)
  fs.writeFileSync(`${__dirname}/main_gen.json`, data);
  console.log("Generated MAIN JSON at ", `${__dirname}/main_gen.json`);
});
export { }
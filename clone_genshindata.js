const fs = require("fs")
const { exec } = require("child_process");

fs.access("./localization/GenshinData", (err) => {
  if (err) {//doesnt exist
    console.log("./localization/GenshinData doesn't exist, cloning repo...");
    exec("cd ./localization && git clone https://github.com/Dimbreath/GenshinData.git")
  } else {
    console.log("./localization/GenshinData  exists, updating repo...");
    exec("cd ./localization && git pull")
  }
})
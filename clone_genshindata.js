const fs = require("fs")
const { exec } = require("child_process");

fs.access("./pipeline/GenshinData", (err) => {
  if (err) {//doesnt exist
    console.log("./pipeline/GenshinData doesn't exist, cloning repo...");
    exec("cd ./pipeline && git clone https://github.com/Dimbreath/GenshinData.git")
  } else {
    console.log("./pipeline/GenshinData  exists, updating repo...");
    exec("cd ./pipeline && git pull")
  }
})
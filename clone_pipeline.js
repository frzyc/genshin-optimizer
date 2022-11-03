const fs = require("fs")
const { exec } = require("child_process");

fs.access("./pipeline", (err) => {
  if (err) {//doesnt exist
    console.log("./pipeline doesn't exist, cloning repo...");
    exec("git clone https://github.com/frzyc/genshin-optimizer-pipeline.git pipeline --depth 1")
  } else {
    console.log("./pipeline exists, updating repo...");
    exec("cd ./pipeline && git pull --depth 1")
  }
})

const express = require('express');
const path = require('path');
const app = express();

const mount_path = '/genshin-optimizer'
app.use(mount_path, express.static(path.join(__dirname, 'build')));

app.get(mount_path, function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = 9000
app.listen(port, () => {
  console.log(`Test Server Listening at http://localhost:${port}${mount_path}`);
});

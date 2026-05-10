const fs = require("fs");
const path = require("path");

function getFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function getExampleFileFixtures() {
  return fs.readdirSync(path.join(__dirname, '..', '..', 'examples'))
    .filter((file) => file.endsWith('.js.dxf') && !file.includes('#'));
}

function normalizeDxfForAssertions(content) {
  // Legacy fixtures include layer plotstyle hard-pointer entries (390/1).
  // Ignore them in string snapshots so layer records can omit invalid pointers.
  return content.replace(/\n390\n[0-9A-Fa-f]+\n/g, '\n');
}

module.exports = {
  getFile,
  getExampleFileFixtures,
  normalizeDxfForAssertions,
};
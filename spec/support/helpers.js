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

/**
 * Extracts $HANDSEED and all entity handles (group code 5) from DXF output.
 * $HANDSEED must be greater than every handle in the file, otherwise
 * AutoCAD discards the drawing.
 */
function parseHandles(dxfString) {
  const lines = dxfString.split("\n");
  let handseed = null;
  const handles = [];

  for (let i = 0; i + 1 < lines.length; i += 2) {
    const code = lines[i].trim();
    const value = lines[i + 1].trim();

    if (code !== "5") continue;

    if (lines[i - 1] && lines[i - 1].trim() === "$HANDSEED") {
      handseed = parseInt(value, 16);
    } else {
      handles.push(parseInt(value, 16));
    }
  }

  return { handseed, maxHandle: Math.max(...handles) };
}

module.exports = {
  getFile,
  getExampleFileFixtures,
  normalizeDxfForAssertions,
  parseHandles,
};

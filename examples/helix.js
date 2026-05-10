const NodeJsDrawing = require('../src/NodeJsDrawing');
const BrowserFriendlyDrawing = require('../src/BrowserFriendlyDrawing');
const mainModule = require('./mainModule');

/**
 * @param {BrowserFriendlyDrawing | NodeJsDrawing} d
 * @returns {Promise<void>}
 */
async function draw(d) {
  await d.drawHelix([0, 0, 0], [5, 0, 0], [0, 0, 1], 3, 4);
}

module.exports = { draw };

if (require.main === module) {
  mainModule(draw);
}
const os = require('os');
const fs = require('fs');
const path = require('path');

const { once } = require('./once');
const BrowserFriendlyDrawing = require('./BrowserFriendlyDrawing');
const TagsManager = require("./TagsManager");

class NodeJsDrawing extends BrowserFriendlyDrawing {
  constructor(stream) {
    super(stream);
  }

  _init() {
    this._tempDir = this._makeTempDir();
    this._tempShapes = this._createTemporaryTagsManager("temporary_shapes.dxf");
  }


  async end() {
    const { tagsManager: headerTagsManager, filepath: headerFilepath, stream: headerStream } = this._createTemporaryTagsManager("header.dxf");
    await this._writeHeader(headerTagsManager);
    headerStream.end();
    await once(headerStream, "finish");

    await this._tempShapes.tagsManager.finaliseWriting();
    this._tempShapes.stream.end();
    await once(this._tempShapes.stream, "finish");

    const { tagsManager: footerTagsManager, filepath: footerFilepath, stream: footerStream } = this._createTemporaryTagsManager("footer.dxf");
    await this._writeFooter(footerTagsManager);
    footerStream.end();
    await once(footerStream, "finish");

    await this._pipeline([
      fs.createReadStream(headerFilepath),
      fs.createReadStream(this._tempShapes.filepath),
      fs.createReadStream(footerFilepath)
    ], this._finalStream);
  }

  _createTemporaryTagsManager(filename) {
    const filepath = path.join(this._tempDir, filename);
    const stream = fs.createWriteStream(filepath);
    return {
      tagsManager: new TagsManager(stream),
      filepath,
      stream,
    }
  }

  async _pipeline(readables, writable) {
    for (const readable of readables) {
      await new Promise((resolve, reject) => {
        readable.pipe(writable, { end: false });
        readable.on('end', resolve);
        readable.on('error', reject);
        writable.on('error', reject);
      });
    }
  }

  _generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  _makeTempDir() {
    const tempDir = path.join(os.tmpdir(), this._generateRandomString(10));
    fs.mkdirSync(tempDir);
    return tempDir;
  }
}

module.exports = NodeJsDrawing;

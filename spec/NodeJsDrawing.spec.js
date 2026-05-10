const fs = require("fs");
const os = require("os");
const path = require("path");

const Drawing = require("../src/NodeJsDrawing");
const Handle = require("../src/Handle");
const {
  getFile,
  getExampleFileFixtures,
  normalizeDxfForAssertions,
} = require("./support/helpers");
const { once } = require("../src/once");

describe("NodeJsDrawing", function () {
  let outputDir;

  beforeAll(() => {
    outputDir = path.join(os.tmpdir(), "output");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
  });

  beforeEach(() => {
    Handle.reset();
  });

  getExampleFileFixtures().forEach((filename) => {
    it(`can draw ${filename}`, async function () {
      const { outputFilepath, exampleFilepath } = setup(outputDir, filename);
      const stream = fs.createWriteStream(outputFilepath);
      const d = new Drawing(stream);
      const { draw } = require(exampleFilepath.replace(".dxf", ""));

      await draw(d);

      await d.end();

      stream.end();

      await once(stream, "finish");

      expect(normalizeDxfForAssertions(getFile(outputFilepath))).toEqual(
        normalizeDxfForAssertions(getFile(exampleFilepath))
      );
    });
  });

  it("can draw a mesh to stream", async function () {
    const { outputFilepath, fixtureFilepath } = setup(outputDir, "mesh-simple-stream.dxf");
    const stream = fs.createWriteStream(outputFilepath);
    var d = new Drawing(stream);

    await d.drawMesh(
      [
        [0, 0, 0],
        [100, 0, 0],
        [0, 100, 0],
        [100, 100, 0],
      ],
      [
        [0, 2, 3],
        [0, 3, 1],
      ]
    );

    await d.end();

    stream.end();

    await once(stream, "finish");

    expect(normalizeDxfForAssertions(getFile(outputFilepath))).toEqual(
      normalizeDxfForAssertions(getFile(fixtureFilepath))
    );
  });
});

function setup(outputDir, filename) {
  const outputFilepath = path.join(outputDir, filename);
  const fixtureFilepath = path.join(__dirname, 'fixtures', filename);
  const exampleFilepath = path.join(__dirname, "..", "examples", filename);
  return { outputFilepath, fixtureFilepath, exampleFilepath };
}
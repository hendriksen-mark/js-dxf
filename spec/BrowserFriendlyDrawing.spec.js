const fs = require("fs");
const os = require("os");
const path = require("path");

const Drawing = require("../src/BrowserFriendlyDrawing");
const Layer = require("../src/Layer");
const Handle = require("../src/Handle");
const {
  getFile,
  getExampleFileFixtures,
  normalizeDxfForAssertions,
} = require("./support/helpers");
const { StringWritableStream } = require("../src/StringWritableStream");
const { once } = require("../src/once");

describe("BrowserFriendlyDrawing", function () {
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
      const { exampleFilepath } = setup(filename);
      const stream = new StringWritableStream();
      const d = new Drawing(stream);
      const { draw } = require(exampleFilepath.replace(".dxf", ""));

      await draw(d);

      await d.end();
      stream.end();
      await once(stream, "finish");

      expect(normalizeDxfForAssertions(stream.toString())).toEqual(
        normalizeDxfForAssertions(getFile(exampleFilepath))
      );
    });
  });

  it("can be just blank", async function () {
    const { fixtureFilepath } = setup("blank.dxf");
    const stream = new StringWritableStream();
    const d = new Drawing(stream);

    await d.end();
    stream.end();
    await once(stream, "finish");

    expect(normalizeDxfForAssertions(stream.toString())).toEqual(
      normalizeDxfForAssertions(getFile(fixtureFilepath))
    );
  });

  it("can add a layer", async function () {
    const { fixtureFilepath } = setup("add_layer.dxf");
    const stream = new StringWritableStream();
    const d = new Drawing(stream);

    d.addLineType("MyDashed", "_ _ _ _ _ _", [0.25, -0.25]);
    d.addLineType("MyCont", "___________", []);
    d.addLayer("MyLayer", Drawing.ACI.GREEN, "MyDashed");

    expect(d._layers["MyLayer"]).toEqual(jasmine.any(Layer));

    await d.end();
    stream.end();
    await once(stream, "finish");

    expect(normalizeDxfForAssertions(stream.toString())).toEqual(
      normalizeDxfForAssertions(getFile(fixtureFilepath))
    );
  });

  it("cannot add a layer with a bad name", function () {
    const stream = new StringWritableStream();
    const d = new Drawing(stream);
    d.addLineType("MyDashed", "_ _ _ _ _ _", [0.25, -0.25]);
    d.addLineType("MyCont", "___________", []);
    expect(() =>
      d.addLayer("/!@<>", Drawing.ACI.GREEN, "MyDashed")
    ).toThrowError();
  });

  it("can draw a mesh", async function () {
    const { fixtureFilepath } = setup("mesh-simple.dxf");

    const stream = new StringWritableStream();
    const d = new Drawing(stream);

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

    expect(normalizeDxfForAssertions(stream.toString())).toEqual(
      normalizeDxfForAssertions(getFile(fixtureFilepath))
    );
  });
});

function setup(filename) {
  const fixtureFilepath = path.join(__dirname, 'fixtures', filename);
  const exampleFilepath = path.join(__dirname, '..', 'examples', filename);
  return { fixtureFilepath, exampleFilepath };
}
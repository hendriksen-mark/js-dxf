const fs = require('fs');
const path = require('path');

const DxfReader = require('dxf').Helper;
const NodeJsDrawing = require('../../src/NodeJsDrawing');
const { once } = require('../../src/once');

function findBoundingBox(vertices) {
    const xx = [];
    const yy = [];

    for (const vertex of vertices) {
        xx.push(vertex[0]);
        yy.push(vertex[1]);
    }

    return [Math.min(...xx), Math.max(...yy), Math.max(...xx), Math.min(...yy)];
}

async function main() {
    const inputPath = path.join(__dirname, '..', 'data', 'octicons-cloud-download.dxf');
    const outputPath = __filename + '.dxf';
    const inputDxf = new DxfReader(fs.readFileSync(inputPath, 'utf-8'));
    const entities = inputDxf.parsed.entities;

    const stream = fs.createWriteStream(outputPath);
    const outputDxf = new NodeJsDrawing(stream);

    // Redraw original cloud.
    for (const entity of entities) {
        entity.array_vertices = [];
        for (const vertex of entity.vertices) {
            entity.array_vertices.push([vertex.x, vertex.y]);
        }

        await outputDxf.drawPolyline(entity.array_vertices);
    }

    // Draw green dashed bounding box around the original.
    const boundingBox = findBoundingBox([
        ...entities[0].array_vertices,
        ...entities[1].array_vertices,
    ]);
    outputDxf.addLayer('l_green', NodeJsDrawing.ACI.GREEN, 'DASHED');
    outputDxf.setActiveLayer('l_green');
    await outputDxf.drawRect(...boundingBox);

    // Draw a copy and move it to the right.
    outputDxf.setActiveLayer('0');
    const width = boundingBox[2] - boundingBox[0];
    for (const entity of entities) {
        const movedVertices = [];
        for (const vertex of entity.array_vertices) {
            movedVertices.push([vertex[0] + width, vertex[1]]);
        }
        await outputDxf.drawPolyline(movedVertices);
    }

    await outputDxf.end();
    stream.end();
    await once(stream, 'finish');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
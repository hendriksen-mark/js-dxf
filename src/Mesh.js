const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Mesh extends DatabaseObject {
    /**
     * @param {array} vertices - Array of vertices like [ [x1, y1, z3], [x2, y2, z3]... ]
     * @param {array} faceIndices - Array of face indices like [ [v1, v2, v3]... ]
     */
    constructor(vertices, faceIndices) {
        super(["AcDbEntity"]);
        this.vertices = vertices;
        this.faceIndices = faceIndices;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-4B9ADA67-87C8-4673-A579-6E4C76FF7025
        await manager.push(0, "MESH");
        await super.tags(manager);
        await manager.push(67, 0);
        await manager.push(8, this.layer.name);
        await manager.push(6, "ByLayer");
        await manager.push(370, 25);
        await manager.push(48, 1.0);
        await manager.push(60, 0);
        // Manually add subclass here as AutoCad seems picky about its position
        await manager.push(100, "AcDbSubDMesh");
        await manager.push(71, 2);
        await manager.push(72, 0);
        await manager.push(91, 0);
        await manager.push(92, this.vertices.length);

        for (const [x, y, z] of this.vertices) {
            await manager.point(x, y, z);
        }

        // Face index count plus each index
        const faceListCount = this.faceIndices.reduce(
            (total, indices) => total + indices.length + 1,
            0
        );

        await manager.push(93, faceListCount);

        for (const indices of this.faceIndices) {
            await manager.push(90, indices.length);

            for (const index of indices) {
                await manager.push(90, index);
            }
        }

        await manager.push(90, 0);
    }
}

module.exports = Mesh;

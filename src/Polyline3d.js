const DatabaseObject = require("./DatabaseObject");
const Handle = require("./Handle");
const Vertex = require("./Vertex");
const TagsManager = require("./TagsManager");

class Polyline3d extends DatabaseObject {
    /**
     * @param {[number, number, number][]} points - Array of points like [ [x1, y1, z1], [x2, y2, z2]... ]
     */
    constructor(points) {
        super(["AcDbEntity", "AcDb3dPolyline"]);
        this.verticies = points.map((point) => {
            const [x, y, z] = point;
            const vertex = new Vertex(x, y, z);
            vertex.ownerObjectHandle = this.handle;
            return vertex;
        });
        this.seqendHandle = Handle.next();
    }
    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-ABF6B778-BE20-4B49-9B58-A94E64CEFFF3
        await manager.push(0, "POLYLINE");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.push(66, 1);
        await manager.push(70, 0);
        await manager.point(0, 0);

        for (const vertex of this.verticies) {
            vertex.layer = this.layer;
            await vertex.tags(manager);
        }

        await manager.push(0, "SEQEND");
        await manager.push(5, this.seqendHandle);
        await manager.push(100, "AcDbEntity");
        await manager.push(8, this.layer.name);
    }
}

module.exports = Polyline3d;

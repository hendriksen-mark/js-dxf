const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Polyline extends DatabaseObject {
    /**
     * @param {array} points - Array of points like [ [x1, y1], [x2, y2, bulge]... ]
     * @param {boolean} closed
     * @param {number} startWidth
     * @param {number} endWidth
     */
    constructor(points, closed = false, startWidth = 0, endWidth = 0) {
        super(["AcDbEntity", "AcDbPolyline"]);
        this.points = points;
        this.closed = closed;
        this.startWidth = startWidth;
        this.endWidth = endWidth;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-748FC305-F3F2-4F74-825A-61F04D757A50
        await manager.push(0, "LWPOLYLINE");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.push(6, "ByLayer");
        await manager.push(62, 256);
        await manager.push(370, -1);
        await manager.push(90, this.points.length);
        await manager.push(70, this.closed ? 1 : 0);

        for (const point of this.points) {
            const [x, y, z] = point;
            await manager.push(10, x);
            await manager.push(20, y);
            if (this.startWidth !== 0 || this.endWidth !== 0) {
                await manager.push(40, this.startWidth);
                await manager.push(41, this.endWidth);
            }
            if (z !== undefined) await manager.push(42, z);
        }
    }
}

module.exports = Polyline;

const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Face extends DatabaseObject {
    constructor(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) {
        super(["AcDbEntity", "AcDbFace"]);
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
        this.x2 = x2;
        this.y2 = y2;
        this.z2 = z2;
        this.x3 = x3;
        this.y3 = y3;
        this.z3 = z3;
        this.x4 = x4;
        this.y4 = y4;
        this.z4 = z4;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-747865D5-51F0-45F2-BEFE-9572DBC5B151
        await manager.push(0, "3DFACE");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.point(this.x1, this.y1, this.z1);

        await manager.push(11, this.x2);
        await manager.push(21, this.y2);
        await manager.push(31, this.z2);

        await manager.push(12, this.x3);
        await manager.push(22, this.y3);
        await manager.push(32, this.z3);

        await manager.push(13, this.x4);
        await manager.push(23, this.y4);
        await manager.push(33, this.z4);
    }
}

module.exports = Face;

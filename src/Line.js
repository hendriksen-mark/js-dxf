const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Line extends DatabaseObject {
    constructor(x1, y1, x2, y2) {
        super(["AcDbEntity", "AcDbLine"]);
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-FCEF5726-53AE-4C43-B4EA-C84EB8686A66
        await manager.push(0, "LINE");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.point(this.x1, this.y1);

        await manager.push(11, this.x2);
        await manager.push(21, this.y2);
        await manager.push(31, 0);
    }
}

module.exports = Line;

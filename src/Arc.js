const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Arc extends DatabaseObject {
    /**
     * @param {number} x - Center x
     * @param {number} y - Center y
     * @param {number} r - radius
     * @param {number} startAngle - degree
     * @param {number} endAngle - degree
     */
    constructor(x, y, r, startAngle, endAngle) {
        super(["AcDbEntity", "AcDbCircle"]);
        this.x = x;
        this.y = y;
        this.r = r;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-0B14D8F1-0EBA-44BF-9108-57D8CE614BC8
        await manager.push(0, "ARC");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.point(this.x, this.y);
        await manager.push(40, this.r);
        await manager.push(100, "AcDbArc");
        await manager.push(50, this.startAngle);
        await manager.push(51, this.endAngle);
    }
}

module.exports = Arc;

const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Circle extends DatabaseObject {
    /**
     * @param {number} x - Center x
     * @param {number} y - Center y
     * @param {number} r - radius
     */
    constructor(x, y, r) {
        super(["AcDbEntity", "AcDbCircle"]);
        this.x = x;
        this.y = y;
        this.r = r;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-8663262B-222C-414D-B133-4A8506A27C18
        await manager.push(0, "CIRCLE");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.point(this.x, this.y);
        await manager.push(40, this.r);
    }
}

module.exports = Circle;

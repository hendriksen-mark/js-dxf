const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Cylinder extends DatabaseObject {
    /**
     * @param {number} x - Center x
     * @param {number} y - Center y
     * @param {number} z - Center z
     * @param {number} r - radius
     * @param {number} thickness - thickness
     * @param {number} extrusionDirectionX - Extrusion Direction x
     * @param {number} extrusionDirectionY - Extrusion Direction y
     * @param {number} extrusionDirectionZ - Extrusion Direction z
     */
    constructor(
        x,
        y,
        z,
        r,
        thickness,
        extrusionDirectionX,
        extrusionDirectionY,
        extrusionDirectionZ
    ) {
        super(["AcDbEntity", "AcDbCircle"]);
        this.x = x;
        this.y = y;
        this.z = z;
        this.r = r;
        this.thickness = thickness;
        (this.extrusionDirectionX = extrusionDirectionX),
            (this.extrusionDirectionY = extrusionDirectionY),
            (this.extrusionDirectionZ = extrusionDirectionZ);
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
        await manager.point(this.x, this.y, this.z);
        await manager.push(40, this.r);
        await manager.push(39, this.thickness);
        await manager.push(210, this.extrusionDirectionX);
        await manager.push(220, this.extrusionDirectionY);
        await manager.push(230, this.extrusionDirectionZ);
    }
}

module.exports = Cylinder;
